import { makeExecutableSchema } from '@graphql-tools/schema';
import { problemTypeDefs } from './problem.schema';
import { userTypeDefs } from './user.schema';
import { resolvers } from '../resolvers/index';

// Root schema
const rootTypeDefs = `
  type Query {
    _empty: String
  }
  
  type Mutation {
    _empty: String
  }
`;

// Combine all type definitions
const typeDefs = [
    rootTypeDefs,
    problemTypeDefs,
    userTypeDefs,
];

// Create executable schema
export const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});