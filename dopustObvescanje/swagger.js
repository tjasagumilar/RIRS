const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger konfiguracija
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SMS API',
      version: '1.0.0',
      description: 'API za pošiljanje SMS sporočil prek Twilio',
    },
    servers: [
      {
        url: 'http://127.0.0.1:5004',
        description: 'Lokalni strežnik',
      },
    ],
  },
  apis: ['./index.js'], // Pot do datoteke, kjer so API rute
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
