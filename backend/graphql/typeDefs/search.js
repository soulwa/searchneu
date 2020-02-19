import { gql } from 'apollo-server';

// Using the Relay cursor connection spec. totalCount is inspired by GitHub's API
const typeDef = gql`
  extend type Query {
    search(query: String!, termId: Int!, first: Int, after: String): SearchConnection
  }

  type SearchConnection {
    edges: [SearchEdge]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type SearchEdge {
    cursor: String!
    node: SearchResult
  }

  union SearchResult = Employee | ClassOccurrence
`;

export default typeDef;
