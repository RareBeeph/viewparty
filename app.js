import http from 'http';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import expressWs from 'express-ws';
import proxy from 'express-http-proxy';

import Obs from './obs.js';

const app = express();
export const server = http.createServer(app);
export const ews = expressWs(app, server);

// view engine setup
app.set('views', path.join(import.meta.dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(import.meta.dirname, 'public')));

const obs = new Obs();
obs.connect();

setInterval(async function () {
  if (await obs.mediaStopped) {
    try {
      await obs.changeMedia();
    } catch {
      console.log('change media failed');

      // future media change attempts short-circuit on empty input name
      // so this assign means we only fail once
      obs.inputName = '';
    }
  }
}, 5000);

app.use(function (req, _res, next) {
  req.obs = obs;
  next();
});

// Load this asynchronously during initialization so express-ws
// can mutate the `express.Router` constructor
const { default: indexRouter } = await import('./routes/index.js');
app.use('/', indexRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// catch 404 and forward to the jsx client
app.get('*', proxy('http://localhost:5173'));

// error handler
app.use(function (err, req, res, _next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
