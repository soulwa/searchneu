/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import _ from 'lodash';

import elastic from './elastic';

import classesScrapers from './scrapers/classes/main';

import macros from './macros';
import database from './database';
import Keys from '../common/Keys';
import ellucianCatalogParser from './scrapers/classes/parsers/ellucianCatalogParser';
import notifyer from './notifyer';

const FIVE_MINUTES = 300000;
const THIRTY_SECONDS = 30000;


class Updater {
  // Don't call this directly, call .create instead.
  constructor() {
    // In dev the cache will be used so we are not actually hitting NEU's servers anyway.
    const intervalTime = macros.PROD ? FIVE_MINUTES : THIRTY_SECONDS;

    setInterval(() => {
      try {
        this.onInterval();
      } catch (e) {
        // noinspection JSIgnoredPromiseFromCall
        macros.warn('Updater failed with :', e);
      }
    }, intervalTime);
  }


  static create() {
    return new this();
  }

  // This checks to see if any seats opened (or anything else changed) in any of the classes that people are watching
  async onInterval() {
    macros.log('updating');
    const startTime = Date.now();

    // Fetch the user data from the database.
    const users = await this.getUsersFromDB();
    if (!users) {
      macros.error('No users in the database!');
      return;
    }

    // List the classes and sections that people are watching
    //   - This data is stored as hashes (Keys...getHash()) in the user DB
    const {
      classHashes, sectionHashes, sectionHashToUsers, classHashToUsers,
    } = this.getWatchedItemsFromUsers(users);

    // Get the old data for watched classes
    const esOldDocs = await elastic.getMapFromIDs(elastic.CLASS_INDEX, classHashes);
    const oldWatchedClasses = _.mapValues(esOldDocs, (doc) => { return doc.class; });

    const oldWatchedSections = this.extractOldWatchedSections(esOldDocs);
    this.checkSectionsWithoutClasses(oldWatchedSections, sectionHashes);

    // Access the URLs from these objects and use them to scrape the latest data about these classes
    const promises = this.scrapeLatestData(oldWatchedClasses);
    _.pull(promises, null);

    let allParsersOutput;

    try {
      allParsersOutput = await Promise.all(promises);
      // Remove any instances where the output was null.
      // This can happen if the class at one of the urls that someone was watching disappeared or was taken down
      // In this case the output of the ellucianCatalogParser will be null.
      _.pull(allParsersOutput, null);
    } catch (e) {
      macros.warn('ellucianCatalogParser call failed in updater with error:', e);
      return;
    }

    const rootNode = {
      type: 'ignore',
      deps: allParsersOutput,
      value: {},
    };

    // Because ellucianCatalogParser returns a list of classes, instead of a singular class, we need to run it on all of them
    const output = classesScrapers.restructureData(rootNode);
    this.verifySectionsClassesDefined(output);

    // Compare with the existing data
    classesScrapers.runProcessors(output);

    // Keep track of which messages to send which users.
    // The key is the facebookMessengerId and the value is a list of messages.
    const userToMessageMap = {};

    this.newSectionAddedToClassMessages(output, oldWatchedClasses, classHashToUsers, userToMessageMap);
    this.seatsOpenedUpMessages(output, oldWatchedSections, sectionHashToUsers, classHashToUsers, userToMessageMap);

    // Update the local data about the changes
    await this.updateElasticWithChanges(output);

    // Loop through the messages and send them.
    // Do this as the very last stage on purpose.
    // If something crashes/breaks above, the new data is saved to the database
    // and does not cause a notification to be sent to users every five minutes
    // (because the new data will be saved, the next time this runs it will compare against the new data)
    // If this is ran before the data is saved, this could happen:
    // Fetch new data -> send notification -> crash (repeat), and never save the updated data.
    this.sendMessages(userToMessageMap);

    this.logTimeTaken(startTime);
  }

  async updateElasticWithChanges(output) {
    const classMap = {};
    this.updateCRNsAndSections(output, classMap);
    await elastic.bulkUpdateFromMap(elastic.CLASS_INDEX, classMap);
  }

  verifySectionsClassesDefined(output) {
    if (!output.sections) {
      output.sections = [];
    }

    if (!output.classes) {
      output.classes = [];
    }
  }

  logTimeTaken(startTime) {
    const totalTime = Date.now() - startTime;
    macros.log('Done running updater onInterval. It took', totalTime, 'ms.');
    macros.logAmplitudeEvent('Updater', {
      totalTime: totalTime,
    });
  }

  async getUsersFromDB() {
    let users = await database.get('users');
    users = Object.values(users);
    return users;
  }

  sendMessages(userToMessageMap) {
    for (const fbUserId of Object.keys(userToMessageMap)) {
      for (const message of userToMessageMap[fbUserId]) {
        notifyer.sendFBNotification(fbUserId, message);
      }
      setTimeout(((facebookUserId) => {
        notifyer.sendFBNotification(facebookUserId, 'Reply with "stop" to unsubscribe from notifications.');
      }).bind(this, fbUserId), 100);

      macros.logAmplitudeEvent('Facebook message sent out', {
        toUser: fbUserId,
        messages: userToMessageMap[fbUserId],
        messageCount: userToMessageMap[fbUserId].length,
      });
    }
  }


  updateCRNsAndSections(output, classMap) {
    for (const aClass of output.classes) {
      const associatedSections = output.sections.filter((s) => {
        return aClass.crns.includes(s.crn);
      });
      // Sort each classes section by crn.
      // This will keep the sections the same between different scrapings.
      if (associatedSections.length > 1) {
        associatedSections.sort((a, b) => {
          return a.crn > b.crn;
        });
      }
      classMap[Keys.getClassHash(aClass)] = {
        class: {
          crns: aClass.crns,
        },
        sections: associatedSections,
      };
    }
  }

  seatsOpenedUpMessages(output, oldWatchedSections, sectionHashToUsers, classHashToUsers, userToMessageMap) {
    for (const newSection of output.sections) {
      const hash = Keys.getSectionHash(newSection);
      const oldSection = oldWatchedSections[hash];

      // This may run in the odd chance that that the following 3 things happen:
      // 1. a user signs up for a section.
      // 2. the section disappears (eg. it is removed from Banner).
      // 3. the section re appears again.
      // If this happens just ignore it for now, but the best would probably to be notify if there are seats open now
      if (!oldSection) {
        macros.warn('Section was added?', hash, newSection, sectionHashToUsers, classHashToUsers);
        continue;
      }

      let message;

      if (newSection.seatsRemaining > 0 && oldSection.seatsRemaining <= 0) {
        // See above comment about space before the exclamation mark.
        message = `A seat opened up in ${newSection.subject} ${newSection.classId} (CRN: ${newSection.crn}). Check it out at https://searchneu.com/${newSection.termId}/${newSection.subject}${newSection.classId} !`;
      } else if (newSection.waitRemaining > 0 && oldSection.waitRemaining <= 0) {
        message = `A wait list seat opened up in ${newSection.subject} ${newSection.classId} (CRN: ${newSection.crn}). Check it out at https://searchneu.com/${newSection.termId}/${newSection.subject}${newSection.classId} !`;
      }

      if (message) {
        const usersToMessage = sectionHashToUsers[hash];
        if (!usersToMessage) {
          continue;
        }

        for (const user of usersToMessage) {
          if (!userToMessageMap[user]) {
            userToMessageMap[user] = [];
          }

          userToMessageMap[user].push(message);
        }
      }
    }
  }

  newSectionAddedToClassMessages(output, oldWatchedClasses, classHashToUsers, userToMessageMap) {
    for (const aNewClass of output.classes) {
      const hash = Keys.getClassHash(aNewClass);

      const oldClass = oldWatchedClasses[hash];

      // Count how many sections are present in the new but not in the old.
      let count = 0;
      if (aNewClass.crns) {
        for (const crn of aNewClass.crns) {
          if (!oldClass.crns.includes(crn)) {
            count++;
          }
        }
      }

      let message = '';
      const classCode = `${aNewClass.subject} ${aNewClass.classId}`;

      if (count === 1) {
        message = `A section was added to ${classCode}!`;
      } else if (count > 1) {
        message = `${count} sections were added to ${classCode}!`;
      }

      if (message) {
        // If there is no space between the classId and the exclamation mark
        // Facebook Messenger on mobile will include the exclamation mark in the hyperlink
        // Oddly enough, Facebook messenger on desktop will not include the exclamation mark in the URL.
        message += ` Check it out at https://searchneu.com/${aNewClass.termId}/${aNewClass.subject}${aNewClass.classId} !`;

        // Get the list of users who were watching this class
        const usersToMessage = classHashToUsers[hash];
        if (!usersToMessage) {
          continue;
        }

        // Send them all a notification.
        for (const user of usersToMessage) {
          if (!userToMessageMap[user]) {
            userToMessageMap[user] = [];
          }

          userToMessageMap[user].push(message);
        }
      }
    }
  }

  scrapeLatestData(oldWatchedClasses) {
    return Object.values(oldWatchedClasses)
      .map((aClass) => {
        return ellucianCatalogParser.main(aClass.prettyUrl)
          .then((newClass) => {
            if (!newClass) {
              // TODO: This should be changed into a notification that the class probably no longer exists. Shouldn't unsubscribe people.
              macros.warn('New class data is null?', aClass.prettyUrl, aClass);
              return null;
            }

            // Copy over some fields that are not scraped from this scraper.
            newClass.value.host = aClass.host;
            newClass.value.termId = aClass.termId;
            newClass.value.subject = aClass.subject;

            return newClass;
          });
      });
  }

  checkSectionsWithoutClasses(oldWatchedSections, sectionHashes) {
    // Track all section hashes of classes that are being watched. Used for sanity check
    const sectionHashesOfWatchedClasses = Object.keys(oldWatchedSections);

    // Sanity check: Find the sections that are being watched, but are not part of a watched class
    for (const sectionHash of _.difference(sectionHashes, sectionHashesOfWatchedClasses)) {
      macros.warn('Section', sectionHash, 'is being watched but it\'s class is not being watched?');
    }
  }

  extractOldWatchedSections(esOldDocs) {
    const oldWatchedSections = {};
    for (const aClass of Object.values(esOldDocs)) {
      for (const section of aClass.sections) {
        oldWatchedSections[Keys.getSectionHash(section)] = section;
      }
    }
    return oldWatchedSections;
  }


  /**
   * Goes through all users and looks at what they're watching, and grabs sections/classes
   *
   * @param users
   * @returns {{sectionHashes: [], classHashToUsers: {}, classHashes: [], sectionHashToUsers: {}}}
   */
  getWatchedItemsFromUsers(users) {
    let classHashes = [];
    let sectionHashes = [];

    const sectionHashToUsers = {};
    const classHashToUsers = {};

    for (const user of users) {
      if (!user.facebookMessengerId) {
        macros.warn('User has no FB id?', JSON.stringify(user));
      }

      // Firebase, for some reason, strips leading 0s from the Facebook messenger id.
      // Add them back here.
      user.facebookMessengerId.padStart(16, '0');

      user.watchingClasses = user.watchingClasses || [];
      user.watchingSections = user.watchingSections || [];

      // When an item is deleted from an array in firebase, firebase doesn't shift the rest of the items down one index.
      // Instead, it adds an undefined item to the array.
      // This removes any possible undefined items from the array.
      // The warnings can be added back when unsubscribing is done with code.
      _.pull(user.watchingClasses, null);
      _.pull(user.watchingSections, null);

      classHashes = classHashes.concat(user.watchingClasses);
      sectionHashes = sectionHashes.concat(user.watchingSections);

      for (const classHash of user.watchingClasses) {
        if (!classHashToUsers[classHash]) {
          classHashToUsers[classHash] = [];
        }

        classHashToUsers[classHash].push(user.facebookMessengerId);
      }

      for (const sectionHash of user.watchingSections) {
        if (!sectionHashToUsers[sectionHash]) {
          sectionHashToUsers[sectionHash] = [];
        }

        sectionHashToUsers[sectionHash].push(user.facebookMessengerId);
      }
    }

    // Remove duplicates. This will occur if multiple people are watching the same class.
    classHashes = _(classHashes).uniq().compact();
    sectionHashes = _(sectionHashes).uniq().compact();

    macros.log('watching classes ', classHashes.size());
    return {
      classHashes: classHashes,
      sectionHashes: sectionHashes,
      sectionHashToUsers: sectionHashToUsers,
      classHashToUsers: classHashToUsers,
    };
  }
}

export default Updater;
