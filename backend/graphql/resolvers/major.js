import { PrismaClient } from '@prisma/client';
import { UserInputError } from 'apollo-server';

const prisma = new PrismaClient();

const noResultsError = (recordType) => {
  throw new UserInputError(`${recordType} not found!`);
};

const getLatestMajorOccurrence = async (majorId, recordType) => {
  const majors = await prisma.major.findMany({
    where: { majorId: majorId },
    orderBy: { catalogYear: { desc: 'desc' } },
    take: 1
  });

  return majors[0] || noResultsError(recordType);
};

const resolvers = {
  Query: {
    major: (parent, args) => { return getLatestMajorOccurrence(args.majorId, 'major'); },
  },
  Major: {
    occurrence: async (major, args) => {
      const majors = prisma.major.findMany({
        where: { majorId: major.majorId, catalogYear: args.year },
        take: 1,
      });
      return majors [0] || noResultsError('occurrence');
    },
    latestOccurrence: (major) => { return getLatestMajorOccurrence(major.majorId, 'latestOccurrence'); },
  },
};

export default resolvers;
