import { Course, Section, User, FollowedCourse, FollowedSection, sequelize } from '../database/models/index';
import { Course as CourseType, Section as SectionType, Requisite } from '../types';
import Updater from '../updater';

afterAll(async () => {
  await sequelize.close();
});

describe('Updater', () => {
  const UPDATER: Updater = new Updater();


  const EMPTY_REQ: Requisite = { type: 'or', values: [] };
  const defaultClassProps = { host: 'neu.edu', classAttributes: [], prettyUrl: 'pretty', desc: 'a class', url: 'url', lastUpdateTime: 20, maxCredits: 4, minCredits: 0, coreqs: EMPTY_REQ, prereqs: EMPTY_REQ };

  const defaultSectionProps = { online: false, honors: false, url: 'url', profs: [], meetings: [] };

  const FUNDIES_ONE: CourseType = {
    classId: '2500',
    name: 'Fundamentals of Computer Science 1',
    termId: '202030',
    subject: 'CS',
    ...defaultClassProps
  };

  const FUNDIES_TWO: CourseType = {
    classId: '2510',
    name: 'Fundamentals of Computer Science 2',
    termId: '202030',
    subject: 'CS',
    ...defaultClassProps
  };

  const PL: CourseType = {
    classId: '4400',
    name: 'Principles of Programming Languages',
    termId: '202030',
    subject: 'CS',
    ...defaultClassProps
  };

  const FUNDIES_ONE_S1: SectionType = {
    crn: '1234',
    classId: '2500',
    termId: '202030',
    subject: 'CS',
    seatsCapacity: 1,
    seatsRemaining: 1,
    waitCapacity: 0,
    waitRemaining: 0,
    ...defaultClassProps,
    ...defaultSectionProps,
  };

  const FUNDIES_ONE_S2: SectionType = {
    crn: '5678',
    classId: '2500',
    termId: '202030',
    subject: 'CS',
    seatsCapacity: 100,
    seatsRemaining: 5,
    waitCapacity: 10,
    waitRemaining: 5,
    ...defaultClassProps,
    ...defaultSectionProps,
  };

  // TODO this is low priority
  describe('modelToUserHash', () => {
    beforeEach(async () => {
      await Course.truncate({ cascade: true, restartIdentity: true });
      await Section.truncate({ cascade: true, restartIdentity: true });
      await User.truncate({ cascade: true, restartIdentity: true });
      await FollowedCourse.truncate({ cascade: true, restartIdentity: true });
      await FollowedSection.truncate({ cascade: true, restartIdentity: true });


      // create two classes, and two sections of one class, and four-ish users.
      // some users being re-used (read: following multiple classes or sections).
      // RULE: every user following a class is also following every section of that class

    });

    it('works for followed courses', () => {
    });
    // to test this function:
    // 1. DBs must be on and active
    // 2. they must have data in:
    //    a. Courses
    //    b. Sections
    //    c. Users
    //    d. FollowedCourses
    //    e. FollowedSections

  });

  describe('generateCourseMsg', () => {
    it('generates the correct message', () => {
      const userToMsg: Record<string, string[]> = {};
      UPDATER.generateCourseMsg(['user1', 'user2'], { type: 'Course', course: FUNDIES_ONE, count: 2 }, userToMsg);      
      expect(userToMsg).toEqual({
        'user1': ['2 sections were added to CS2500! Check it out at https://searchneu.com/202030/CS2500 !'],
        'user2': ['2 sections were added to CS2500! Check it out at https://searchneu.com/202030/CS2500 !'],
      });
    });
  });

  describe('generateSectionMsg', () => {
    it('generates the correct message', () => {
      const userToMsg: Record<string, string[]> = {};
      UPDATER.generateSectionMsg(['user1', 'user2'], { type: 'Section', section: FUNDIES_ONE_S2 }, userToMsg);
      expect(userToMsg).toEqual({
        'user1': [`A seat opened up in CS2500 (CRN: 5678). Check it out at https://searchneu.com/202030/CS2500 !`],
        'user2': [`A seat opened up in CS2500 (CRN: 5678). Check it out at https://searchneu.com/202030/CS2500 !`],
      });
    });
  });


});
