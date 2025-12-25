import { type Request, type Response, type NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Validation middleware factory
 * Validates request body, query, or params against a Zod schema
 */
export const validate = (schema: z.ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get data from the specified source
            const data = req[source];

            // Validate and parse data
            const validatedData = await schema.parseAsync(data);

            // Replace request data with validated data
            // For body, we can assign directly
            if (source === 'body') {
                req.body = validatedData;
            } else {
                // For query and params, use Object.assign to merge validated data
                Object.assign(req[source], validatedData);
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Format validation errors
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors,
                });
            }

            // Pass other errors to error handler
            next(error);
        }
    };
};

/**
 * Validate multiple sources at once
 */
export const validateMultiple = (schemas: {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
    params?: z.ZodSchema;
}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate body if schema provided
            if (schemas.body) {
                const validatedBody = await schemas.body.parseAsync(req.body);
                req.body = validatedBody;
            }

            // Validate query if schema provided
            if (schemas.query) {
                const validatedQuery = await schemas.query.parseAsync(req.query);
                Object.assign(req.query, validatedQuery);
            }

            // Validate params if schema provided
            if (schemas.params) {
                const validatedParams = await schemas.params.parseAsync(req.params);
                Object.assign(req.params, validatedParams);
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors,
                });
            }

            next(error);
        }
    };
};