const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger konfiguracija
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Office API',
      version: '1.0.0',
      description: 'API za upravljanje pisarn',
    },
    servers: [
      {
        url: 'http://127.0.0.1:5005',
        description: 'Lokalni server',
      },
    ],
  },
  apis: ['./index.js'], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = { swaggerSpec, swaggerUi };
