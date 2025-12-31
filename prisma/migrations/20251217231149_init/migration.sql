-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problems" (
    "id" SERIAL NOT NULL,
    "frontend_question_id" TEXT,
    "title" TEXT NOT NULL,
    "title_slug" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "paid_only" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "description_url" TEXT,
    "solution_url" TEXT,
    "solution_code_url" TEXT,
    "description" TEXT,
    "solution" TEXT,
    "solution_code_python" TEXT,
    "solution_code_java" TEXT,
    "solution_code_cpp" TEXT,
    "category" TEXT,
    "acceptance_rate" DOUBLE PRECISION,
    "topics" TEXT[],
    "hints" TEXT[],
    "likes" INTEGER DEFAULT 0,
    "dislikes" INTEGER DEFAULT 0,
    "total_accepted" TEXT,
    "total_submission" TEXT,
    "similar_questions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "problems_title_slug_key" ON "problems"("title_slug");

-- CreateIndex
CREATE INDEX "problems_difficulty_idx" ON "problems"("difficulty");

-- CreateIndex
CREATE INDEX "problems_title_slug_idx" ON "problems"("title_slug");
