var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
import "reflect-metadata";

var indexRouter = require("./routes/index");
 // const buildPath = path.join(__dirname, 'public');
const buildPath = path.join(__dirname, '../..', 'build');

var app = express();

app.set('views', buildPath);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(buildPath));
//app.use(cors());

app.use("/", indexRouter);

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
