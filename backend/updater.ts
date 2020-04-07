/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import _ from 'lodash';
import { Op } from 'sequelize';

import macros from './macros';
import Keys from '../common/Keys';
import notifyer from './notifyer';
import dumpProcessor from './dumpProcessor';
import { Course, Section, sequelize } from './database/models/index';
import HydrateSerializer from './database/serializers/hydrateSerializer';
import termParser from './scrapers/classes/parsersxe/termParser';
import { Course as CourseType, Section as SectionType } from './types';

// TYPES
interface OldData {
  oldWatchedClasses:  Record<string, CourseType>,
  oldWatchedSections: Record<string, SectionType>,
  oldSectionsByClass: Record<string, string[]>
}

interface SerializedResult {
  class: CourseType,
  sections: SectionType[]
}

export type Notification = CourseNotification | SectionNotification;

interface CourseNotification {
  type: 'Course',
  course: CourseType,
  count: number,
}

interface SectionNotification {
  type: 'Section',
  section: SectionType,
}

class Updater {
  // produce a new Updater instance
  COURSE_MODEL: string;
  SECTION_MODEL: string;

  static create() {
    return new this();
  }

  // DO NOT call the constructor, instead use .create
  constructor() {
    this.COURSE_MODEL = 'course';
    this.SECTION_MODEL = 'section';
  }

  // TODO must call this in server
  async start() {
    // 5 min if prod, 30 sec if dev.
    // In dev the cache will be used so we are not actually hitting NEU's servers anyway.
    const intervalTime = macros.PROD ? 300000 : 30000;

    setInterval(() => {
      try { 
        this.update(); 
      } catch (e) { 
        macros.warn('Updater failed with: ', e); 
      }
    }, intervalTime);
    // TODO this seems unnecessary?
    this.update();
  }


  // Update classes and sections users are watching and notify them if seats have opened up
  async update() {
    if (macros.DEV) return;

    macros.log('updating');
    const startTime = Date.now();

    const classHashToUsers: Record<string, string[]> = await this.modelToUserHash(this.COURSE_MODEL);
    const sectionHashToUsers: Record<string, string[]> = await this.modelToUserHash(this.SECTION_MODEL);

    const classHashes: string[] = Object.keys(classHashToUsers);
    const sectionHashes: string[] = Object.keys(sectionHashToUsers);

    if (classHashes.length === 0 && sectionHashes.length === 0) {
      return;
    }

    macros.log('watching classes ', classHashes.length);

    const { oldWatchedClasses, oldWatchedSections, oldSectionsByClass } = await this.getOldData(classHashes);

    // Track all section hashes of classes that are being watched. Used for sanity check
    const sectionHashesOfWatchedClasses: string[] = Object.keys(oldWatchedSections);

    // Sanity check: Find the sections that are being watched, but are not part of a watched class
    for (const sectionHash of _.difference(sectionHashes, sectionHashesOfWatchedClasses)) {
      macros.warn('Section', sectionHash, "is being watched but it's class is not being watched?");
    }

    // scrape everything
    // TODO rename
    const sections: Section[] = termParser.requestsSectionsForTerm('202110');
    const newSectionsByClass: Record<string, string[]> = _.groupBy(sections, (sec) => sec.classHash);

    const notifications: Notification[] = [];

    Object.entries(newSectionsByClass).map(([classHash, sectionHashes]) => {
      const sectionDiffCount: number = sectionHashes.filter((hash: string) => !oldSectionsByClass[classHash].includes(hash)).length;
      if (sectionDiffCount > 0) {
        notifications.push({ type: 'Course', course: oldWatchedClasses[classHash], count: sectionDiffCount });
      }
    });

    sections.map((sec: SectionType) => {
      const oldSection: SectionType = oldWatchedSections[Keys.getSectionHash(sec)];
      if ((sec.seatsRemaining > 0 && oldSection.seatsRemaining <= 0) || (sec.waitRemaining > 0 && oldSection.waitRemaining <= 0)) {
        notifications.push({ type: 'Section', section: sec });
      }
    });

    await this.sendMessages(notifications, classHashToUsers, sectionHashToUsers);
    await dumpProcessor.main({ termDump: { sections } });

    const totalTime = Date.now() - startTime;

    macros.log('Done running updater onInterval. It took', totalTime, 'ms.');

    macros.logAmplitudeEvent('Updater', {
      totalTime: totalTime,
    });
  }

  // TODO purpose
  async modelToUserHash(modelName: string): Promise<Record<string, string[]>> {
    const columnName = `${modelName}Id`;
    const dbResults = await sequelize.query(`SELECT "${columnName}", ARRAY_AGG("userId") FROM "FollowedCourses" GROUP BY "${columnName}"`, 
                                      { type: sequelize.QueryTypes.SELECT });
    return Object.assign({}, ...dbResults.map((res) => ({ [res[columnName]]: res.array_agg })));
  }


  // TODO purpose 
  async getOldData(classHashes: string[]): Promise<OldData> {
    const oldDocs: SerializedResult[] = await (new HydrateSerializer(Section)).bulkSerialize(await Course.findAll({ where: { id: { [Op.in]: classHashes } } }));

    const oldWatchedClasses = oldDocs.reduce((courseObj: Record<string, CourseType>, doc: SerializedResult): Record<string, CourseType> => {
      courseObj[Keys.getClassHash(doc.class)] = doc.class;
      return courseObj;
    }, {});

    // TODO bad
    const oldSectionsByClass = _.mapValues(oldDocs, (doc: SerializedResult) => Keys.getClassHash(doc.class));

    const oldWatchedSections = {};
    for (const aClass of Object.values(oldDocs)) {
      for (const section of aClass.sections) {
        oldWatchedSections[Keys.getSectionHash(section)] = section;
      }
    }

    return { oldWatchedClasses, oldWatchedSections, oldSectionsByClass };
  }

  // TODO would be nice to shorten these types and whatnot
  async sendMessages(notifs: Notification[], classHashToUsers: Record<string, string[]>, sectionHashToUsers: Record<string, string[]>): Promise<void> {
    // user to message map
    const userToMsg: Record<string, string[]> = {};
    notifs.forEach((notif: Notification) => {
      if (notif.type === 'Course') {
        const userIds: string[] = classHashToUsers[Keys.getClassHash(notif.course)];
        this.generateCourseMsg(userIds, notif, userToMsg);
      } else if (notif.type === 'Section') {
        const userIds: string[] = sectionHashToUsers[Keys.getSectionHash(notif.section)];
        this.generateSectionMsg(userIds, notif, userToMsg);
      }
    });

    Object.keys(userToMsg).forEach((userId: string) => {
      userToMsg[userId].map((msg: string) => {
        notifyer.sendFBNotification(userId, msg);
      });

      setTimeout(() => {
        notifyer.sendFBNotification(userId, 'Reply with "stop" to unsubscribe from notifications.');
      }, 100);

      macros.logAmplitudeEvent('Facebook message sent out', {
        toUser: userId,
        messages: userToMsg[userId],
        messageCount: userToMsg[userId].length,
      });
    });
  }

  generateCourseMsg(userIds: string[], courseNotif: CourseNotification, userToMsg: Record<string, string[]>): void {
    const classCode: string = `${courseNotif.course.subject}${courseNotif.course.classId}`;
    let message: string = '';
    if (courseNotif.count === 1) message += `A section was added to ${classCode}!`;
    else message += `${courseNotif.count} sections were added to ${classCode}!`;
    message +=  ` Check it out at https://searchneu.com/${courseNotif.course.termId}/${courseNotif.course.subject}${courseNotif.course.classId} !`;

    userIds.forEach((userId: string) => {
      if (!userToMsg[userId]) userToMsg[userId] = [];
      userToMsg[userId].push(message);
    });
  }

  generateSectionMsg(userIds: string[], sectionNotif: SectionNotification, userToMsg: Record<string, string[]>): void {
    const classCode: string = `${sectionNotif.section.subject}${sectionNotif.section.classId}`;
    let message: string;

    if (sectionNotif.section.seatsRemaining > 0) message = `A seat opened up in ${classCode} (CRN: ${sectionNotif.section.crn}). Check it out at https://searchneu.com/${sectionNotif.section.termId}/${sectionNotif.section.subject}${sectionNotif.section.classId} !`;
    else message = `A waitlist seat has opened up in ${classCode} (CRN: ${sectionNotif.section.crn}). Check it out at https://searchneu.com/${sectionNotif.section.termId}/${sectionNotif.section.subject}${sectionNotif.section.classId} !`;

    userIds.forEach((userId: string) => {
      if (!userToMsg[userId]) userToMsg[userId] = [];
      userToMsg[userId].push(message);
    });
  }
}

export default Updater;
