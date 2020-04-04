var express = require('express');
var router = express.Router();
var db = require('../lib/db.js'); 
var template = require('../lib/template.js');
var sanitizeHtml = require('sanitize-html');

function throwError(error){ //에러가 발생하면 보여주는 함수
    if(error){
      throw error;
    }
}

router.get('/create', function(request, response){
    var title = 'Create topic';
    var list = template.list(request.topics);
    var selectAuthor = template.selectAuthor(request.authors);
    var body = `
    <h2>${title}</h2>
    <form action="/topic/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
            <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>${selectAuthor}</p>
        <p><input type="submit" value="create"></p>
    </form>
    `;
    var control = '';
    var html = template.HTML(title, list, body, control);
    response.send(html);
});

router.post('/create_process', function(request, response){
    var title = request.body.title;
    var description = request.body.description;
    var author_id = request.body.author_id;
    db.query(`INSERT INTO topic (title, description, created, author_id) VALUES (?, ?, NOW(), ?)`, [title, description, author_id], 
        function(error, results){
        throwError(error);
        response.redirect(`/topic/${results.insertId}`);
    });
});

router.get('/update/:pageID', function(request, response){
    db.query(`SELECT * FROM topic WHERE id = ?`, [request.params.pageID], function(error, topic){
        throwError(error);
        var title = topic[0].title;
        var list = template.list(request.topics);
        var control = `<a href="/create">create</a> <a href="/update?id=${request.params.pageID}">update</a>`;
        var body = `
            <h2>Update topic</h2>
            <form action="/topic/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                <p>
                <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                </p>
                <p>
                <input type="submit" value="update">
                </p>
            </form>
        `;
        var html = template.HTML(title, list, body, control);
        response.send(html);
    });
});

router.post('/update_process', function(request, response){
    var id = request.body.id;
    var title = request.body.title;
    var description = request.body.description;
    db.query(`UPDATE topic SET title=?, description=?, created=NOW() WHERE id = ?`, [title, description, id], function(error, result){
        throwError(error);
        response.redirect(`/topic/${id}`);
    });
});

router.post('/delete_process', function(request, response){
    var id = request.body.id;
    db.query(`DELETE FROM topic WHERE id=?`, [id], function(error, result){
        throwError(error);
        response.redirect('/');
    });
});

router.get('/:pageID', function(request, response){
    db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id = ?`, [request.params.pageID], function(error, topic){
        throwError(error);
        db.query(`SELECT * FROM topic`, function(error2, topics){
          throwError(error2);
          var sanitizedTitle = sanitizeHtml(topic[0].title);
          var sanitizedDescription = sanitizeHtml(topic[0].description);
          var sanitizedAuthorName = sanitizeHtml(topic[0].name);
          var list = template.list(topics);
          var body = `<h2>${sanitizedTitle}</h2>${sanitizedDescription} <p>by ${sanitizedAuthorName}</p>`;
          var control = ` 
            <a href="/topic/create">create</a>
            <a href="/topic/update/${request.params.pageID}">update</a>
            <form action="/topic/delete_process" method="post">
              <input type="hidden" name="id" value="${request.params.pageID}">
              <input type="submit" value="delete">
            </form>
          `;
          var html = template.HTML(sanitizedTitle, list, body, control);
          response.writeHead(200);
          response.end(html);
        });
    });    
});

module.exports = router;