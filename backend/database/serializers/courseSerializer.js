/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import { PrismaClient } from '@prisma/client';
import _ from 'lodash';

class CourseSerializer {
  // this is a hack to get around the circular dependency created by [elasticSerializer -> courseSerializer -> database/index -> database/course -> elasticSerializer]

  async bulkSerialize(instances) {
    const courses = instances.map((course) => { return this.serializeCourse(course); });

    const sections = await (new PrismaClient()).findMany({
      where: {
        classHash: { in: instances.map((instance) => instance.id) },
      },
    });

    const classToSections = _.groupBy(sections, 'classHash');

    return _(courses).keyBy(this.getClassHash).mapValues((course) => {
      return this.bulkSerializeCourse(course, classToSections[this.getClassHash(course)] || []);
    }).value();
  }

  bulkSerializeCourse(course, sections) {
    const serializedSections = this.serializeSections(sections, course);

    return {
      class: course,
      sections: serializedSections,
      type: 'class',
    };
  }

  serializeSections(sections, parentCourse) {
    if (sections.length === 0) return sections;
    return sections.map((section) => { return this.serializeSection(section); }).map((section) => {
      return { ...section, ..._.pick(parentCourse, this.courseProps()) };
    });
  }

  serializeCourse(course) {
    // TODO unclear what type Prisma will return for lastUpdateTime
    course.lastUpdateTime = course.lastUpdateTime.getTime();
    return this.finishCourseObj(course);
  }

  serializeSection(section) {
    return this.finishSectionObj(section);
  }

  // TODO this should definitely be eliminated
  getClassHash(course) {
    return ['neu.edu', course.termId, course.subject, course.classId].join('/');
  }

  courseProps() {
    throw new Error('not implemented');
  }

  finishCourseObj(_course) {
    throw new Error('not implemented');
  }

  finishSectionObj(_section) {
    throw new Error('not implemented');
  }
}

export default CourseSerializer;
