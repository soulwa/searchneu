/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.  */

import pMap from 'p-map';
import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';
import Keys from '../common/Keys';
import macros from './macros';
import { PrismaClient } from '@prisma/client';

class DumpProcessor {
  constructor() {
    this.CHUNK_SIZE = 5;
  }

  /**
   * @param {Object} termDump object containing all class and section data, normally acquired from scrapers
   * @param {Object} profDump object containing all professor data, normally acquired from scrapers
   */
  async main({ termDump = {}, profDump = {}, destroy = false }) {
    const prisma = new PrismaClient();
    const coveredTerms = new Set();

    await pMap(Object.values(profDump), async (prof) => {
      const profData = this.processProf(prof);
      return prisma.professor.upsert({
        where: { id: profData.id },
        create: profData,
        update: profData,
      });
    }, { concurrency: this.CHUNK_SIZE });

    await pMap(Object.values(termDump.classes), async (course) => {
      const courseData = this.processCourse(course, coveredTerms);
      return prisma.course.upsert({
        where: { id: courseData.id },
        create: courseData,
        update: courseData,
      });
    }, { concurrency: this.CHUNK_SIZE });

    await pMap(Object.values(termDump.sections), async (section) => {
      const sectionData = this.processSection(section);
      return prisma.section.upsert({
        where: { id: sectionData.id },
        create: sectionData,
        update: sectionData,
      });
    }, { concurrency: this.CHUNK_SIZE });

    if (destroy) {
      await prisma.course.deleteMany({
        where: {
          termId: { in: Array.from(coveredTerms) },
          lastUpdateTime: { lt: new Date(new Date() - 48 * 60 * 60 * 1000) },
        },
      });
    }

    /*
    // destroy courses that haven't been updated in over 2 days
    if (destroy) {
      await Course.destroy({
        where: {
          termId: { [Op.in]: Array.from(coveredTerms) },
          updatedAt: { [Op.lt]: new Date(new Date() - 48 * 60 * 60 * 1000) },
        },
      });
    }
    // Upsert ES
    await Course.bulkUpsertES(courseInstances);
    sequelize.options.logging = true;
    */
  }

  processProf(profInfo) {
    const correctedQuery = { ...profInfo, emails: { set: profInfo.emails } };
    return _.omit(correctedQuery, ['title', 'interests', 'officeStreetAddress']);
  }

  processCourse(classInfo, coveredTerms) {
    coveredTerms.add(classInfo.termId);

    const additionalProps = {
      id: `${Keys.getClassHash(classInfo)}`,
      description: classInfo.desc,
      minCredits: Math.floor(classInfo.minCredits),
      maxCredits: Math.floor(classInfo.maxCredits),
      lastUpdateTime: new Date(classInfo.lastUpdateTime),
    };

    const correctedQuery = {
      ...classInfo,
      ...additionalProps,
      classAttributes: { set: classInfo.classAttributes },
      nupath: { set: classInfo.nupath }
    };

    return _.omit(correctedQuery, ['desc']);
  }

  processSection(secInfo) {
    const additionalProps = { id: `${Keys.getSectionHash(secInfo)}`, classHash: Keys.getClassHash(secInfo), profs: { set: secInfo.profs } };
    return _.omit({ ...secInfo, ...additionalProps }, ['classHash', 'classId', 'termId', 'subject', 'host']);
  }
}

const instance = new DumpProcessor();

async function fromFile(termFilePath, empFilePath) {
  const termExists = await fs.pathExists(termFilePath);
  const empExists = await fs.pathExists(empFilePath);

  if (!termExists || !empExists) {
    macros.error('need to run scrape before indexing');
    return;
  }

  const termDump = await fs.readJson(termFilePath);
  const profDump = await fs.readJson(empFilePath);
  await instance.main({ termDump: termDump, profDump: profDump });
}

if (require.main === module) {
  // If called directly, attempt to index the dump in public dir
  const termFilePath = path.join(macros.PUBLIC_DIR, 'getTermDump', 'allTerms.json');
  const empFilePath = path.join(macros.PUBLIC_DIR, 'employeeDump.json');
  fromFile(termFilePath, empFilePath).catch(macros.error);
}

export default instance;
