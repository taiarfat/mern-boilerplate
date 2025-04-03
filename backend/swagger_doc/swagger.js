import swaggerAutogen from 'swagger-autogen';
import swaggerSchemas from './swagger-schemas.js';

const doc = {
    info: {
        version: '',            // by default: '1.0.0'
        title: 'NodeJs-Best-Practices',              // by default: 'REST API'
        description: ''         // by default: ''
    },
    servers: [
        {
            url: 'http://localhost:3000',              // by default: 'http://localhost:3000'
            description: 'Local server'
        },

    ],
    tags: [
        {
            name: 'User',
            description: ''
        },
        {
            name: 'Auth',
            description: ''
        },
        // { ... }
    ],
    components: {},
    '@definitions': {
        // ==========================   User Schema   ==========================
        addUser: swaggerSchemas.addUser,
        updateUser: swaggerSchemas.updateUser,
        // ==========================   Auth Schema   ==========================
        login: swaggerSchemas.login
    }
};



const outputFile = './swagger-output.json';
const routes = ['../app.js'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);