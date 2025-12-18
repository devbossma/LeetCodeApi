import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../lib/prisma';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface LeetCodeProblem {
    frontendQuestionId?: string;
    title: string;
    titleSlug?: string;
    title_slug?: string;
    difficulty?: string;
    paidOnly?: boolean;
    url?: string;
    description_url?: string;
    descriptionUrl?: string;
    solution_url?: string;
    solutionUrl?: string;
    solution_code_url?: string;
    solutionCodeUrl?: string;
    description?: string;
    solution?: string;
    solution_code_python?: string;
    solutionCodePython?: string;
    solution_code_java?: string;
    solutionCodeJava?: string;
    solution_code_cpp?: string;
    solutionCodeCpp?: string;
    category?: string;
    acceptance_rate?: number;
    acceptanceRate?: number;
    topics?: string[];
    hints?: string[];
    likes?: number;
    dislikes?: number;
    totalAccepted?: string;
    total_accepted?: string;
    totalSubmission?: string;
    total_submission?: string;
    similar_questions?: any;
    similarQuestions?: any;
}

async function seedProblems(): Promise<void> {
    try {
        console.log('🌱 Starting to seed LeetCode problems...');

        // Read the JSON file
        const dataPath = join(__dirname, '../../data/leetcode_problems.json');

        let problems: LeetCodeProblem[];

        try {
            const rawData = readFileSync(dataPath, 'utf8');
            const parsed = JSON.parse(rawData);

            // Handle different JSON formats
            if (Array.isArray(parsed)) {
                problems = parsed;
            } else if (parsed.data && Array.isArray(parsed.data)) {
                problems = parsed.data;
            } else {
                problems = [parsed];
            }
        } catch (parseError) {
            console.error('❌ Error reading/parsing JSON file:', parseError);
            throw parseError;
        }

        console.log(`📊 Found ${problems.length} problems to seed`);

        // Clear existing data (optional)
        console.log('🗑️  Clearing existing problems...');
        const deleteResult = await prisma.problem.deleteMany({});
        console.log(`🗑️  Deleted ${deleteResult.count} existing problems`);

        // Seed problems in batches for better performance
        const batchSize = 100;
        let successCount = 0;
        let errorCount = 0;
        const errors: { title: string; error: string }[] = [];

        for (let i = 0; i < problems.length; i += batchSize) {
            const batch = problems.slice(i, i + batchSize);

            console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(problems.length / batchSize)}`);

            // Process batch with Promise.allSettled for better error handling
            const results = await Promise.allSettled(
                batch.map(async (problem) => {
                    return prisma.problem.create({
                        data: {
                            frontendQuestionId: problem.frontendQuestionId?.toString() || null,
                            title: problem.title,
                            titleSlug: problem.titleSlug || problem.title_slug || problem.title.toLowerCase().replace(/\s+/g, '-'),
                            difficulty: problem.difficulty || 'Medium',
                            paidOnly: problem.paidOnly || false,

                            // URLs
                            url: problem.url || null,
                            descriptionUrl: problem.description_url || problem.descriptionUrl || null,
                            solutionUrl: problem.solution_url || problem.solutionUrl || null,
                            solutionCodeUrl: problem.solution_code_url || problem.solutionCodeUrl || null,

                            // Content
                            description: problem.description || null,
                            solution: problem.solution || null,

                            // Code solutions
                            solutionCodePython: problem.solution_code_python || problem.solutionCodePython || null,
                            solutionCodeJava: problem.solution_code_java || problem.solutionCodeJava || null,
                            solutionCodeCpp: problem.solution_code_cpp || problem.solutionCodeCpp || null,

                            // Metadata
                            category: problem.category || 'Algorithms',
                            acceptanceRate: problem.acceptance_rate || problem.acceptanceRate || null,
                            topics: Array.isArray(problem.topics) ? problem.topics : [],
                            hints: Array.isArray(problem.hints) ? problem.hints : [],

                            // Statistics
                            likes: problem.likes || 0,
                            dislikes: problem.dislikes || 0,
                            totalAccepted: problem.totalAccepted || problem.total_accepted || null,
                            totalSubmission: problem.totalSubmission || problem.total_submission || null,

                            // Related
                            similarQuestions: problem.similar_questions || problem.similarQuestions || null,
                        },
                    });
                })
            );

            // Count successes and failures
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    successCount++;
                } else {
                    errorCount++;
                    const problemTitle = batch[index].title;
                    errors.push({
                        title: problemTitle,
                        error: result.reason?.message || 'Unknown error'
                    });
                }
            });
        }

        console.log('\n✅ Seeding completed!');
        console.log(`📊 Successfully seeded: ${successCount} problems`);

        if (errorCount > 0) {
            console.log(`⚠️  Errors: ${errorCount} problems`);
            console.log('\nFirst 5 errors:');
            errors.slice(0, 5).forEach(({ title, error }) => {
                console.log(`  - "${title}": ${error}`);
            });
        }

        // Verify count
        const count = await prisma.problem.count();
        console.log(`📈 Total problems in database: ${count}`);

        // Show sample data
        const sample = await prisma.problem.findFirst({
            select: {
                id: true,
                title: true,
                difficulty: true,
                topics: true,
            }
        });

        if (sample) {
            console.log('\n📝 Sample problem:');
            console.log(JSON.stringify(sample, null, 2));
        }

    } catch (error) {
        console.error('❌ Fatal error during seeding:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Execute the seed function
seedProblems()
    .then(() => {
        console.log('\n✅ Seeding script finished successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Seeding script failed:', error);
        process.exit(1);
    });

export { seedProblems };