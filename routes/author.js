var express = require('express');
var router = express.Router();
var db = require('../lib/db.js'); 
var template = require('../lib/template.js');

function throwError(error){ //에러가 발생하면 보여주는 함수
    if(error){
      throw error;
    }
}

router.get('/', function(request, response){
    if(request.session.is_login === true){//로그인 상태라면
        var title = 'Authors page';
        var list = template.list(request.topics);
        var authorTable = template.getAuthorTable(request.authors);
        var body = `<h2>${title}</h2> ${authorTable}`;
        var control = `<a href="/author/create">create</a>`;
        var html = template.HTML(title, list, body, control, template.authStatusUI(request));
        response.send(html);
    }else{//아니라면
        response.redirect('/auth/login');
    }
});

router.get('/create', function(request, response){
    if(request.session.is_login === true){//로그인 상태라면
        var title = 'Create author';
        var list = template.list(request.topics);
        var body = `
            <h2>${title}</h2> 
            <form action="/author/create_process" method="post">
                <p><input type="text" name="author_name" placeholder="name"></p>
                <p><textarea name="author_profile" placeholder="profile"></textarea></p>
                <p><input type="submit" value="create"></p>
            </form>
        `;
        var control = ``;
        var html = template.HTML(title, list, body, control, template.authStatusUI(request));
        response.send(html);
    }else{
        response.redirect('/auth/login');
    }
});

router.post('/create_process', function(request, response){
    if(request.session.is_login === true){//로그인 상태라면
        var name = request.body.author_name;
        var profile = request.body.author_profile;
        db.query(`INSERT INTO author (name, profile) VALUES (?, ?)`, [name, profile], 
            function(error, results){
                throwError(error);
                response.redirect('/author');
        });
    }else{
        response.redirect('/auth/login');
    }
 });

router.get('/update/:pageID', function(request, response){
    if(request.session.is_login === true){//로그인 상태라면
        db.query(`SELECT * FROM author WHERE id = ?`, [request.params.pageID], function(error, author){
            throwError(error);
            var title = 'Update author';
            var list = template.list(request.topics);
            var control = ``;
            var body = `
            <h2>${title}</h2>
            <form action="/author/update_process" method="post">
                <input type="hidden" name="author_id" value="${author[0].id}">
                <p><input type="text" name="author_name" placeholder="name" value="${author[0].name}"></p>
                <p>
                <textarea name="author_profile" placeholder="profile">${author[0].profile}</textarea>
                </p>
                <p>
                <input type="submit" value="update">
                </p>
            </form>
            `;
            var html = template.HTML(title, list, body, control, template.authStatusUI(request));
            response.send(html);
        });
    }else{
        response.redirect('/auth/login');
    }
    
});

router.post('/update_process', function(request, response){
    if(request.session.is_login === true){//로그인 상태라면
        var id = request.body.author_id;
        var name = request.body.author_name;
        var profile = request.body.author_profile;
        db.query(`UPDATE author SET name=?, profile=? WHERE id = ?`, [name, profile, id], function(error, result){
            throwError(error);
            response.redirect('/author');
        });
    }else{
        response.redirect('/auth/login');
    }
});

router.post('/delete_process', function(request, response){
    if(request.session.is_login === true){//로그인 상태라면
        var id = request.body.author_id;
        db.query(`DELETE FROM author WHERE id=?`, [id], function(error, result){
            throwError(error);
            response.redirect('/author');
        });
    }else{
        response.redirect('/auth/login');
    }
});

module.exports = router;