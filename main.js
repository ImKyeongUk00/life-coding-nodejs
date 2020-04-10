var express = require('express');
var app = express();
var indexRouter = require('./routes/index.js');
var topicRouter = require('./routes/topic.js');
var authorRouter = require('./routes/author.js');
var authRouter = require('./routes/auth.js');
var db = require('./lib/db.js');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
var session = require('./lib/session-start');
var passport = require('passport');
var errorControl = require('./lib/error.js');

//나의 앱에 필요한 써드파티 미들웨어
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(helmet());

//인증 관련 middle ware
app.use(session);
app.use(passport.initialize());//express에 passport를 설치
app.use(passport.session());//passport가 내부적으로 session을 사용

//내가 만든 helper middle ware for my application 
app.get('*', function(request, response, next){//topic목록 불러오는 미들웨어
  db.query(`SELECT * FROM topic`, function(error, topics){
      errorControl.throw(error, next);
      request.topics = topics;
      next();
  });
});

app.use(function(request, response, next){//author목록 불러오는 미들웨어
  db.query(`SELECT * FROM author`, function(error, authors){
      errorControl.throw(error, next);
      request.authors = authors;
      next();
  });
});

//router 불러오기
app.use('/', indexRouter);//index page
app.use('/topic', topicRouter);//topic page
app.use('/author', authorRouter);// author page
app.use('/auth', authRouter);// auth page

//error control
app.use(function(err, request, response, next) {//500
  console.error(err.stack);
  response.status(500).send('Something broke!');
});

app.use(function(request, response, next) { //404
  response.status(404).send('Error: Not Found');
});

app.listen(3000, function(){
  console.log(`Example app listening at http://localhost:3000`);
});

module.exports = app;