export const problemTypeDefs = `
  type Problem {
    id: Int!
    frontendQuestionId: String
    title: String!
    titleSlug: String!
    difficulty: String!
    paidOnly: Boolean!
    url: String
    descriptionUrl: String
    solutionUrl: String
    solutionCodeUrl: String
    description: String
    solution: String
    solutionCodePython: String
    solutionCodeJava: String
    solutionCodeCpp: String
    category: String
    acceptanceRate: Float
    topics: [String!]!
    hints: [String!]!
    likes: Int
    dislikes: Int
    totalAccepted: String
    totalSubmission: String
    similarQuestions: JSON
    createdAt: String!
    updatedAt: String!
  }

  type ProblemConnection {
    data: [Problem!]!
    pagination: Pagination!
  }

  type Pagination {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
  }

  type ProblemStatistics {
    total: Int!
    byDifficulty: DifficultyStats!
    totalTopics: Int!
    topics: [String!]!
  }

  type DifficultyStats {
    easy: Int!
    medium: Int!
    hard: Int!
  }

  enum Difficulty {
    Easy
    Medium
    Hard
  }

  input ProblemFilters {
    difficulty: Difficulty
    topic: String
    search: String
  }

  input CreateProblemInput {
    title: String!
    titleSlug: String!
    difficulty: Difficulty!
    description: String
    topics: [String!]
    hints: [String!]
  }

  input UpdateProblemInput {
    title: String
    titleSlug: String
    difficulty: Difficulty
    description: String
    topics: [String!]
    hints: [String!]
  }

  scalar JSON

  extend type Query {
    # Get paginated problems
    problems(
      page: Int = 1
      limit: Int = 20
      filters: ProblemFilters
    ): ProblemConnection!

    # Get single problem by ID
    problem(id: Int!): Problem

    # Get problem by slug
    problemBySlug(slug: String!): Problem

    # Search problems
    searchProblems(query: String!): [Problem!]!

    # Get problems by difficulty
    problemsByDifficulty(difficulty: Difficulty!): [Problem!]!

    # Get problems by topic
    problemsByTopic(topic: String!): [Problem!]!

    # Get statistics
    problemStatistics: ProblemStatistics!
  }

  extend type Mutation {
    # Create problem (requires authentication)
    createProblem(input: CreateProblemInput!): Problem!

    # Update problem (requires authentication)
    updateProblem(id: Int!, input: UpdateProblemInput!): Problem!

    # Delete problem (requires authentication)
    deleteProblem(id: Int!): Boolean!
  }
`;