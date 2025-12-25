
export const userTypeDefs = `
  type User {
    id: ID!
    username: String!
    email: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Query {
    # Get current user (requires authentication)
    me: User
  }

  extend type Mutation {
    # Register new user
    register(input: RegisterInput!): AuthPayload!

    # Login
    login(input: LoginInput!): AuthPayload!
  }
`;