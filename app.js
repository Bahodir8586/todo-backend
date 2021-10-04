const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter=require("./routes/userRoutes")

const app = express();
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Middlewares against attacks
const limiter = rateLimit({
  max: 30,
  windowMs: 60 * 1000,
  message: "Too many requests from this IP. Please try again in an hour"
});
app.use("/api", limiter);
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist:[""] }));
// Serving static files
app.use(express.static(`${__dirname}/public`));

// Routes will be there
app.use('/api/users',userRouter)

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
