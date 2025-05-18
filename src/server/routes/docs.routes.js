
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const router = express.Router();

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Digital Grocery Store API',
      version: '1.0.0',
      description: 'API documentation for Digital Grocery Store',
      contact: {
        name: 'API Support',
        email: 'support@umistore.com',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/server/routes/*.js', './src/server/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec));

router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

module.exports = router;
