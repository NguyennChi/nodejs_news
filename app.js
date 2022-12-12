var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash        = require('req-flash');


const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');

const pathConfig = require('./path');

// Define path
global.__base                       = __dirname + '/';
global.__path_app                   = __base + pathConfig.folder_app + '/';
global.__path_configs               = __path_app + pathConfig.folder_configs + '/';
global.__path_helpers               = __path_app + pathConfig.folder_helpers + '/';
global.__path_schemas               = __path_app + pathConfig.folder_schemas  + '/';
global.__path_routers_backend       = __path_app + pathConfig.folder_routers_backend + '/';
global.__path_views_backend         = __path_app + pathConfig.folder_views_backend + '/';
global.__path_public                = __base + pathConfig.folder_public + '/';
global.__path_uploads               = __path_public + pathConfig.folder_uploads + '/';
global.__path_routers_frontend      = __path_app + pathConfig.folder_routers_frontend + '/';
global.__path_views_frontend        = __path_app + pathConfig.folder_views_frontend + '/';


const systemConfig = require (__path_configs + 'system');
var app = express();


// mongoose connect
mongoose.connect('mongodb+srv://nguyenchi:nguyenchi@atlascluster.fuuukty.mongodb.net/newsProject')

.then(
  () => {console.log('connect success'); },
  err => {console.log(err); }
);
app.use(session({
  secret: 'abcnhds',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 5*60*1000
  }
}
));

// view engine setup
app.set('views', path.join(__dirname, 'app/views/frontend'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', __path_views_frontend + '/frontend');

// app.use(logger('dev'));
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));


// Local variable
app.locals.systemConfig = systemConfig;


// router set up
app.use('/', require(__path_routers_frontend + 'index'));
app.use(`/${systemConfig.prefixAdmin}`, require(__path_routers_backend + 'index'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render(__path_views_backend +  'error');
});

module.exports = app;
