import { makeExecutableSchema } from '@graphql-tools/schema';
import { problemTypeDefs } from './problem.schema.js';
import { userTypeDefs } from './user.schema.js';
import { resolvers } from '../resolvers/index.js';

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