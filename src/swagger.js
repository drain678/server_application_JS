import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Todo API",
            version: "1.0.0",
            description: "API для управления пользователями, задачами и комментариями",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },

        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
    },

    apis: [
        "./src/routes/auth.js",
        "./src/routes/order_items.js",
        "./src/routes/orders.js",
        "./src/routes/users.js",
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("Swagger доступен по адресу: http://localhost:3000/api-docs");
};