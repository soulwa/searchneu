import { MajorData } from '../../database/models/index';

const { UserInputError } = require('apollo-server');

const noResultsError = (recordType) => {
  throw new UserInputError(`${recordType} not found!`);
};

const getLatestMajorOccurrence = async (majorId, recordType) => {
  const response = await MajorData.findOne({
    where: { majorId: majorId },
    order: [['catalogYear', 'DESC']],
    limit: 1,
  });

  return (response || noResultsError(recordType));
};

const resolvers = {
  Query: {
    majorIds: () => { 
      return MajorData.findAll({ attributes: ['majorId'], raw: true }).then((majors) => majors.map(major => major.majorId));
    },
    major: (parent, args) => { return getLatestMajorOccurrence(args.majorId, 'major'); },
  },
  Major: {
    occurrence: async (major, args) => {
      const response = await MajorData.findOne({
        where: { majorId: major.majorId, catalogYear: args.year },
        limit: 1,
      });
      return (response || noResultsError('occurrence'));
    },
    latestOccurrence: (major) => { return getLatestMajorOccurrence(major.majorId, 'latestOccurrence'); },
  },
};

export default resolvers;
