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


//나의 앱에 필요한 써드파티 미들웨어
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(helmet());

//세션 시작
app.use(session);

function throwError(error){ //에러가 발생하면 log로 보내주는 함수
  if(error){
    throw error;
  }
}

//topic목록 불러오는 미들웨어
app.get('*', function(request, response, next){
  db.query(`SELECT * FROM topic`, function(error, topics){
      throwError(error);
      console.log(request.session);
      request.topics = topics;
      next();
  });
});
//author목록 불러오는 미들웨어
app.use(function(request, response, next){
  db.query(`SELECT * FROM author`, function(error, authors){
      throwError(error);
      request.authors = authors;
      next();
  });
});

//router 불러오기
app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/author', authorRouter);
app.use('/auth', authRouter);

//error control
app.use(function(err, request, response, next) {//
  console.error(err.stack);
  response.status(500).send('Something broke!');
});

app.use(function(request, response, next) { //404
  response.status(404).send('Error: Not Found');
});

app.listen(3000, function(){
  console.log(`Example app listening at http://localhost:3000`);
});