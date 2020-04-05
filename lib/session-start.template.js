var express = require('express');
var app = express();
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
 
var options = {
    host: '',
    user: '',
    password: '',
    database: ''
};
 
var sessionStore = new MySQLStore(options);
 
//세션시작
module.exports = app.use(session({
  secret: '',
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));
