import { gql } from 'apollo-server';

/* Follow the cursor connection spec:
 * https://relay.dev/graphql/connections.htm
 * Objects that implement Node need to have a GUID unique across all objects:
 * https://facebook.github.io/relay/graphql/objectidentification.htm#sec-Node-Interface
*/

const typeDef = gql`
  interface Node {
    id: ID!
  }

  type PageInfo {
    endCursor: String,
    hasNextPage: Boolean!,
    hasPreviousPage: Boolean!,
    startCursor: String
  }
`;

export default typeDef;
