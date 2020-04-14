var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');
var db = require('../lib/db.js');
var errorControl = require('../lib/error.js');
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//passport의 local 전략 사용
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
function(email, password, done) {
  db.query(`SELECT * FROM users WHERE email=?`, [email], function(error, user){
    if(user[0] === undefined){//없는 email
      return done(null, false, { message: 'Incorrect email.' });
    }else{
      bcrypt.compare(password, user[0].password, function(err, result) {
        if(result !== true){
          return done(null, false, { message: 'Incorrect password.' });
        }else{
          return done(null, user[0]);
        }
      });
    }  
  });
}));

passport.serializeUser(function(user, done) {//login에 성공하면 그 때 딱 한 번 실행되어 session store에 session data를 저장해준다.
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {//page에 접근 할 때마다 실행되어 사용자의 정보를 넘겨준다. request.user객체가 여기서 생성될듯
  db.query(`SELECT * FROM users WHERE id=?`, [id], function(error, user){
    done(null, user[0]);
  });
});

router.get('/login', function(request, response){
    var title = 'Login';
    var list = template.list(request.topics);
    var body = `
        <h2>${title}</h2>
        <form action="/auth/login_process" method="post">
            <p><input type="text" name="email" placeholder="email"></p>
            <p><input type="password" name="password" placeholder="password"></p>
            <p><input type="submit" value="login"></p>
        </form>
    `;
    var control = ``;
    var html = template.HTML(title, list, body, control, auth.statusUI(request));
    response.send(html);
});

router.post('/login_process',
  passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/auth/login',
  })
);

router.get('/logout_process', function(request, response, next){
    if(auth.is_login(request)){//로그인 상태라면
        request.logout();
        request.session.save(function(){
            response.redirect(`/`);
        });
    }else{
        response.redirect('/auth/login');
    }
});

router.get('/register', function(request, response){
  var title = 'Register';
  var list = template.list(request.topics);
  var body = `
      <h2>${title}</h2>
      <form action="/auth/register_process" method="post">
          <p><input type="text" name="email" placeholder="email"></p>
          <p><input type="password" name="password" placeholder="password"></p>
          <p><input type="password" name="password2" placeholder="password again"></p>
          <p><input type="text" name="nicname" placeholder="nicname"></p>
          <p><input type="submit" value="register"></p>
      </form>
    `;
    var control = ``;
    var html = template.HTML(title, list, body, control, auth.statusUI(request));
    response.send(html);
});

router.post('/register_process', function(request, response, next){
  db.query(`SELECT * FROM users WHERE email=?`, [request.body.email], function(error, user){
    errorControl.throw(error, next);
    
    if(user[0] === undefined){//이메일 중복이 아니면
      if(request.body.password !== request.body.password2){
        response.send('<h1>비밀번호 에러</h1>');
      }else{
        bcrypt.hash(request.body.password, 10, function(error1, hash) {
          errorControl.throw(error1, next);

          db.query(`INSERT INTO users (email, password, nicname) VALUES (?, ?, ?)`, 
          [request.body.email, hash, request.body.nicname],
          function(error2){
            errorControl.throw(error2, next);
            response.redirect('/auth/login');
          });  
        });
      }
    }else{
      response.send('<h1>이메일 중복</h1>');
    }
  });
});

module.exports = router;