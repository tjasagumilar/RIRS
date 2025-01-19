const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger konfiguracija
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dopusti API',
      version: '1.0.0',
      description: 'API za upravljanje z dopusti',
    },
    servers: [
      {
        url: 'http://127.0.0.1:5001',
        description: 'Lokalni strežnik',
      },
    ],
  },
  apis: ['./index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
