const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger konfiguracija
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prihodi API',
      version: '1.0.0',
      description: 'API za upravljanje z prihodi',
    },
    servers: [
      {
        url: 'http://127.0.0.1:5002',
        description: 'Lokalni strežnik',
      },
    ],
    components: {
      schemas: {
        Prihod: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Enoličen identifikator prihoda',
            },
            idZaposlenega: {
              type: 'string',
              description: 'ID zaposlenega',
            },
            prihod: {
              type: 'string',
              description: 'Čas prihoda zaposlenega na delo',
            },
            odhod: {
              type: 'string',
              description: 'Čas odhoda zaposlenega z dela',
            },
            malicaZacetek: {
              type: 'string',
              description: 'Čas začetka malice',
            },
            malicaKonec: {
              type: 'string',
              description: 'Čas konca malice',
            },
            datum: {
              type: 'string',
              format: 'date',
              description: 'Datum, ko se je zgodil prihod',
            },
            lokacija: {
              type: 'string',
              description: 'Lokacija, kjer se je zgodil prihod (npr. Pisarna ali Od doma)',
            },
          },
        },
      },
    },
  },
  apis: ['./index.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
