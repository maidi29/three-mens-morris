const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const ensureSecure = require('./middlewares/ensureSecure');
require ('newrelic');

import "reflect-metadata";

 // const buildPath = path.join(__dirname, 'public');
const buildPath = path.join(__dirname, '../..', 'build');
const environment = process.env;
const app = express();
if (environment.NODE_ENV === 'production') {
  app.use(ensureSecure);
}
app.set('views', buildPath);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(logger((':date[iso] :url :status :remote-addr :referrer')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(buildPath));

app.get('/*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.status.toString());
});

export default app;
