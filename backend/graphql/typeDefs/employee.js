import { gql } from 'apollo-server';

const typeDef = gql`
  type Employee {
    name: String,
    firstName: String,
    phone: String,
    emails: [String],
    primaryRole: String,
    primaryDepartment: String,
    url: String,
    officeRoom: String,
    officeStreetAddress: String,
    personalSite: String,
    bigPictureUrl: String,
  }
`;

export default typeDef;
