var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');

const userData = {
    email :'imkyeonguk00@gmail.com',
    password : '000000',
    nicname : 'devUk'
};

router.get('/login', function(request, response){
    var title = 'Login';
    var list = template.list(request.topics);
    var body = `
        <h2>${title}</h2>
        <form action="/auth/login_process" method="post">
            <p><input type="text" name="user_email" placeholder="email"></p>
            <p><input type="password" name="user_password" placeholder="password"></p>
            <p><input type="submit" value="login"></p>
        </form>
    `;
    var control = ``;
    var html = template.HTML(title, list, body, control, template.authStatusUI(request));
    response.send(html);
});

router.post('/login_process', function(request, response){
    var userEmail = request.body.user_email;
    var userPassword = request.body.user_password;

    if(userEmail === userData.email && userPassword === userData.password){
        request.session.is_login = true;
        request.session.nicname = userData.nicname;
        request.session.save(function(){
            response.redirect(`/`);
        });
    }else{
        request.session.is_login = false;
        response.send('who? <a href="/auth/login">다시 로그인</a>');
    }
});

router.get('/logout_process', function(request, response, next){
    if(request.session.is_login === true){//로그인 상태라면
        request.session.destroy(function(error) {
            response.redirect('/');
            next(error);
        });
    }else{
        response.redirect('/auth/login');
    }
});

module.exports = router;