/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import { PrismaClient } from '@prisma/client';
import { User, FollowedSection, FollowedCourse } from './database/models/index';


class Database {
  // key is the primaryKey (id, facebookMessengerId) of the user
  // value is any updated columns plus all watchingSections and watchingClasses
  async set(key, value) {
    const prisma = new PrismaClient();
    // TODO probably broken . . . need a `set` somewhere?
    await prisma.user.upsert({ id: key, ...value });

    await Promise.all([FollowedSection.destroy({ where: { userId: key } }), FollowedCourse.destroy({ where: { userId: key } })]);
    if (value.watchingSections) {
      await Promise.all(value.watchingSections.map((section) => { return FollowedSection.create({ userId: key, sectionId: section }); }));
    }

    if (value.watchingClasses) {
      await Promise.all(value.watchingClasses.map((course) => { return FollowedCourse.create({ userId: key, courseId: course }); }));
    }
  }

  // Get the value at this key.
  // Key follows the same form in the set method
  async get(key) {
    const user = await User.findByPk(key);
    if (!user) {
      return null;
    }

    const watchingSections = await FollowedSection.findAll({ where: { userId: user.id }, attributes: ['sectionId'] }).map((section) => { return section.sectionId; });
    const watchingClasses = await FollowedCourse.findAll({ where: { userId: user.id }, attributes: ['courseId'] }).map((course) => { return course.courseId; });

    return {
      facebookMessengerId: user.id,
      facebookPageId: user.facebookPageId,
      firstName: user.firstName,
      lastName: user.lastName,
      loginKeys: user.loginKeys,
      watchingSections: watchingSections,
      watchingClasses: watchingClasses,
    };
  }

  async getByLoginKey(requestLoginKey) {
    const user = await User.findOne({ where: { loginKeys: { [Op.contains]: [requestLoginKey] } } });
    if (!user) {
      return null;
    }
    return this.get(user.id);
  }
}


export default new Database();
