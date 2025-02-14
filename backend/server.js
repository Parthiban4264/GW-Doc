const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const projectRoutes = require('./routes/projects');
const uploadRoutes = require('./routes/uploads');
const exportRoutes = require('./routes/export');
const Database = require('./db');

const app = express();
app.locals.db = new Database();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project Documentation API',
      version: '1.0.0',
      description: 'API for managing projects and documentation',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/export', exportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});
