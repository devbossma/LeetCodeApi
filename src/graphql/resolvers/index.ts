import { GraphQLScalarType, Kind } from 'graphql';
import { problemResolvers } from './problem.resolver.js';
import { userResolvers } from './user.resolver.js';

// Merge resolvers properly

// Custom JSON scalar
const JSONScalar = new GraphQLScalarType({
    name: 'JSON',
    description: 'JSON custom scalar type',
    serialize(value: any) {
        return value;
    },
    parseValue(value: any) {
        return value;
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return JSON.parse(ast.value);
        }
        return null;
    },
});

// Combine all resolvers
export const resolvers = {
    JSON: JSONScalar,
    Query: {
        ...problemResolvers.Query,
        ...userResolvers.Query,
    },
    Mutation: {
        ...problemResolvers.Mutation,
        ...userResolvers.Mutation,
    },
};