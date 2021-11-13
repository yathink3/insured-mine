const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const errorHandler = require('./middleware/error');
const dbo = require('./database');

const PORT = process.env.PORT || 5000;

const app = express();

// Rate limiting
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 100 });

app.use(limiter);
app.set('trust proxy', 10);

// Enable cors
app.use(cors());
app.use(express.json());

// Set static folder
app.use(express.static('public'));

// Routes
app.use('/api', require('./routes'));

// Error handler middleware
app.use(errorHandler);

//mongodb connection
dbo.connectToServer(err => {
  if (err) {
    console.error(err);
    process.exit();
  }
  // start the Express server
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
});
