import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import { Application, Request, Response } from 'express';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Habitual API',
      version: '1.0.0',
      description: 'Habit tracking REST API built with Node.js + Express + TypeScript',
      contact: {
        name: 'Maharshi',
        email: '007maharshigohel@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.habitual.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication',
        },
      },
    },
  },
  // IMPORTANT: Point to .ts files (not .js)
  apis: ['./src/**/*.ts'],        // scans all your route/controller files
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app: Application) => {
  // Swagger UI
  app.use(
    '/api-docs',
    serve,
    setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: 'Habitual API Docs',
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );

  // Raw JSON spec (useful for Postman, Insomnia, etc.)
  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default { setupSwagger, swaggerSpec };
