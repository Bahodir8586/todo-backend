const express=require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');


const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Limiting the rate of the requests
const limiter = rateLimit({
  max: 30,
  windowMs: 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour'
});
app.use('/api', limiter);
// Serving static files
app.use(express.static(`${__dirname}/public`));

// Routes will be there

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
