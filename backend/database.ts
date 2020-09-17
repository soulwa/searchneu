/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import { PrismaClient } from '@prisma/client';
import _ from 'lodash';


class Database {

  // key is the primaryKey (id, facebookMessengerId) of the user
  // value is any updated columns plus all watchingSections and watchingClasses
  async set(key, value) {
    const prisma = new PrismaClient();
    // TODO probably broken . . . need a `set` somewhere? --> login keys?
    const updatedUser = _.omit({ ...value, loginKeys: { set: value.loginKeys || [] } }, ['watchingClasses', 'watchingSections']);
    await prisma.user.upsert({
      where: { id: key },
      create: { id: key, ...updatedUser },
      update: updatedUser,
    });

    await Promise.all([prisma.followedSection.deleteMany({ where: { userId: key } }), prisma.followedCourse.deleteMany({ where: { userId: key } })]);

    if (value.watchingSections) {
      await Promise.all(value.watchingSections.map((section) => { return prisma.followedSection.create({ data: { user: { connect: { id: key } }, section: { connect: { id: section } } } }); }));
    }

    if (value.watchingClasses) {
      await Promise.all(value.watchingClasses.map((course) => { return prisma.followedCourse.create({ data: { user: { connect: { id: key } }, course: { connect: { id: course } } } }); }));
    }

    await prisma.$disconnect();
  }

  // Get the value at this key.
  // Key follows the same form in the set method
  async get(key) {
    const prisma = new PrismaClient();
    const user = await prisma.user.findOne({ where: { id: key } });

    if (!user) {
      await prisma.$disconnect();
      return null;
    }

    const watchingSections = (await prisma.followedSection.findMany({ where: { userId: user.id }, select: { sectionId: true } })).map(section => section.sectionId);
    const watchingClasses = (await prisma.followedCourse.findMany({ where: { userId: user.id }, select: { courseId: true } })).map(course => course.courseId);

    await prisma.$disconnect();

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
    const prisma = new PrismaClient();
    const user = (await prisma.$queryRaw(`SELECT * FROM users WHERE '${requestLoginKey}'=ANY(login_keys)`))[0];

    await prisma.$disconnect();

    if (!user) {
      return null;
    }

    return this.get(user.id);
  }
}


export default new Database();
