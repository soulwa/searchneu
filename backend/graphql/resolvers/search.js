import elastic from '../../elastic';
import { convertCursorToNodeId, convertNodeIdToCursor } from './connection';

const resolvers = {
  Query: {
    search: async (parent, args) => {
      const min = args.after ? convertCursorToNodeId(args.after) : 0;

      const { searchContent, resultCount } = await elastic.search(args.query, args.termId, min, min + args.first);
      const lastIndex = min + searchContent.length;

      const pageInfo = {
        endCursor: convertNodeIdToCursor(lastIndex),
        hasNextPage: lastIndex + 1 < resultCount,
        hasPreviousPage: min > 0,
        startCursor: convertNodeIdToCursor(min),
      };

      const edges = searchContent.map((result, i) => {
        return {
          cursor: convertNodeIdToCursor(min + i),
          node: result.employee || result.class,
        };
      });

      return {
        pageInfo: pageInfo, edges: edges, totalCount:resultCount,
      };
    },
  },
  SearchResult: {
    __resolveType: (obj) => {
      if (obj.firstName) {
        return 'Employee';
      }
      if (obj.classId) {
        return 'ClassOccurrence';
      }
      return null;
    },
  },
};

export default resolvers;
