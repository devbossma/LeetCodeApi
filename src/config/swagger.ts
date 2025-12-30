import { type Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'LeetCode Problems API',
            version: '1.0.0',
            description: 'RESTful API for browsing and managing LeetCode problems with authentication and caching',
            contact: {
                name: 'API Support',
                email: 'support@example.com',
            },
        },
        servers: [
            {
                url: process.env.APP_MODE === 'production'
                    ? `http://${process.env.PROD_APP_HOST || 'localhost'}`
                    : `http://localhost:${process.env.PORT || 3000}`,
                description: process.env.APP_MODE === 'production' ? 'Production server' : 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                Problem: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' },
                        titleSlug: { type: 'string' },
                        difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
                        topics: { type: 'array', items: { type: 'string' } },
                        likes: { type: 'integer' },
                        dislikes: { type: 'integer' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string' },
                    },
                },
            },
        },
        tags: [
            { name: 'Problems', description: 'Problem management endpoints' },
            { name: 'Auth', description: 'Authentication endpoints' },
        ],
    },
    // Use different paths for development vs production
    apis: process.env.APP_MODE === 'production'
        ? [
            './dist/api/v1/routes/*.js',
            './src/api/v1/routes/*.ts', // Fallback to source if available
        ]
        : ['./src/api/v1/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(specs, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'LeetCode API Docs',
            swaggerOptions: {
                url: '/api-docs/swagger.json',
                // Force HTTP protocol (don't auto-detect)
                supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
            },
        })
    );

    // Serve swagger spec as JSON
    app.get('/api-docs/swagger.json', (req, res) => {
        res.json(specs);
    });

    console.log('📚 Swagger docs available at /api-docs');
}