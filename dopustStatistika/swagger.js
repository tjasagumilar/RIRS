const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger konfiguracija
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Statistika API',
      version: '1.0.0',
      description: 'API za upravljanje in statistiko dopustov',
    },
    servers: [
      {
        url: 'http://127.0.0.1:5003',
        description: 'Lokalni strežnik',
      },
    ],
  },
  apis: ['./index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
