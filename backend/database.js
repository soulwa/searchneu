/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import { PrismaClient } from '@prisma/client';
import { User, FollowedSection, FollowedCourse } from './database/models/index';


class Database {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // key is the primaryKey (id, facebookMessengerId) of the user
  // value is any updated columns plus all watchingSections and watchingClasses
  async set(key, value) {
    // TODO probably broken . . . need a `set` somewhere? --> login keys?
    await this.prisma.user.upsert({ id: key, ...value });

    await Promise.all([this.prisma.followedSection.deleteMany({ where: { userId: key } }), this.prisma.followedCourse.deleteMany({ where: { userId: key } })]);
    if (value.watchingSections) {
      await Promise.all(value.watchingSections.map((section) => { return this.prisma.followedSection.create({ userId: key, sectionId: section }); }));
    }

    if (value.watchingClasses) {
      await Promise.all(value.watchingClasses.map((course) => { return this.prisma.followedCourse.create({ userId: key, courseId: course }); }));
    }
  }

  // Get the value at this key.
  // Key follows the same form in the set method
  async get(key) {
    const user = await this.prisma.user.findOne({ id: key });

    if (!user) {
      return null;
    }

    const watchingSections = await this.prisma.followedSection.findMany({ where: { userId: user.id }, select: { sectionId: true } }).map(section => section.sectionId);
    const watchingClasses = await this.prisma.followedCourse.findMany({ where: { userId: user.id }, select: { courseId: true } }).map(course => course.courseId);

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
    // TODO if this doesn't work, two things need to be done:
    // 1. figure out why loginKeys isn't query-able
    // 2. can just execute a raw query for the ID information
    // 3. why isn't this abstracted behavior with this.get?
    const user = (await this.prisma.user.findMany({ where: { loginKeys: { contains: requestLoginKey } } }))[0];

    if (!user) {
      return null;
    }
    return this.get(user.id);
  }
}


export default new Database();
