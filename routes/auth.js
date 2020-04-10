var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

const userData = { //단일 사용자의 계정, 비밀번호, 닉네임 정보
    email :'imkyeonguk00@gmail.com',
    password : '000000',
    nicname : 'devUk'
};

//passport의 local 전략 사용
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
function(username, password, done) {
  if(username === userData.email){
    if(password === userData.password){
      return done(null, userData);
    }else{
      return done(null, false, { message: 'Incorrect password.' });
    }
  }else{
    return done(null, false, { message: 'Incorrect email.' });
  }
}));

passport.serializeUser(function(user, done) {//login에 성공하면 그 때 딱 한 번 실행되어 session store에 session data를 저장해준다.
  done(null, user.email);
});

passport.deserializeUser(function(id, done) {//page에 접근 할 때마다 실행되어 사용자의 정보를 넘겨준다.
  done(null, userData);
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

module.exports = router;