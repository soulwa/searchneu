/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import { PrismaClient } from '@prisma/client';
import HydrateCourseSerializer from '../../database/serializers/hydrateCourseSerializer';

const serializer = new HydrateCourseSerializer();

const serializeValues = (results) => {
  return results.map((result) => serializer.serializeCourse(result));
}

const getLatestClassOccurrence = async (subject, classId) => {
  const prisma = new PrismaClient();
  const results = await prisma.course.findMany({ where: { subject, classId }, orderBy: { termId: 'desc' } });
  await prisma.$disconnect();
  return serializeValues(results)[0];
}

const getAllClassOccurrences = async (subject, classId) => {
  const prisma = new PrismaClient();
  const results = await prisma.course.findMany({ where: { subject, classId }, orderBy: { termId: 'desc' } });
  await prisma.$disconnect();
  return serializeValues(results);
}

const getClassOccurrence = async (subject, classId, termId) => {
  const prisma = new PrismaClient();
  const res = await prisma.course.findOne({
    where: {
      uniqueCourseProps: { subject, classId, termId },
    },
  });
  await prisma.$disconnect();

  return serializeValues([res])[0];
}

const resolvers = {
  Query: {
    class: (parent, args) => { return getLatestClassOccurrence(args.subject, args.classId && args.classId.toString()); },
  },
  Class: {
    latestOccurrence: (clas) => { return getLatestClassOccurrence(clas.subject, clas.classId); },
    allOccurrences: (clas) => { return getAllClassOccurrences(clas.subject, clas.classId); },
    occurrence: (clas, args) => { return getClassOccurrence(clas.subject, clas.classId, args.termId.toString()); },
  },
};

export default resolvers;
