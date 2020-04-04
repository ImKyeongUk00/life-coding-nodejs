var http = require('http');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var sanitizeHtml = require('sanitize-html');
var db = require('./lib/db.js');


function throwError(error){ //에러가 발생하면 보여주는 함수
  if(error){
    throw error;
  }
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){//index page
        db.query('SELECT * FROM topic', function(error, topics){
          throwError(error);
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(topics);
          var body = `<h2>${title}</h2>${description}`;
          var control = `<a href="/create">create</a>`
          var html = template.HTML(title, list, body, control);
          response.writeHead(200);
          response.end(html);
        });
      } else {//topic page
          db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id = ?`, [queryData.id], function(error, topic){
            throwError(error);
            db.query(`SELECT * FROM topic`, function(error2, topics){
              throwError(error2);
              var sanitizedTitle = sanitizeHtml(topic[0].title);
              var sanitizedDescription = sanitizeHtml(topic[0].description);
              var sanitizedAuthorName = sanitizeHtml(topic[0].name);
              var list = template.list(topics);
              var body = `<h2>${sanitizedTitle}</h2>${sanitizedDescription} <p>by ${sanitizedAuthorName}</p>`;
              var control = ` 
                <a href="/create">create</a>
                <a href="/update?id=${queryData.id}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${queryData.id}">
                  <input type="submit" value="delete">
                </form>
              `;
              var html = template.HTML(sanitizedTitle, list, body, control);
              response.writeHead(200);
              response.end(html);
            });
          });
        }
    } else if(pathname === '/create'){//create form page
        db.query(`SELECT * FROM topic`, function(error, topics){
          throwError(error);
          db.query(`SELECT * FROM author`, function(error2, authors){
            throwError(error2);
            var title = 'create';
            var list = template.list(topics);
            var selectAuthor = template.selectAuthor(authors);
            var body = `
              <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                  <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                  ${selectAuthor}
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>
            `;
            var control = '';
            var html = template.HTML(title, list, body, control);
            response.writeHead(200);
            response.end(html);
          });
        });
      } else if(pathname === '/create_process'){//topic을 생성해주는 프로세스
          var body = '';
          request.on('data', function(data){
              body = body + data;
          });
          request.on('end', function(){
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            var author_id = post.author_id;
            db.query(`INSERT INTO topic (title, description, created, author_id) VALUES (?, ?, NOW(), ?)`, [title, description, author_id], 
              function(error, results){
                throwError(error);
                response.writeHead(302, {Location: `/?id=${results.insertId}`});
                response.end();
              });
          });
    } else if(pathname === '/update'){//topic update form page
        db.query(`SELECT * FROM topic`, function(error, topics){
          throwError(error);
          db.query(`SELECT * FROM topic WHERE id = ?`, [queryData.id], function(error2, topic){
            throwError(error2);
            var title = topic[0].title;
            var list = template.list(topics);
            var control = `<a href="/create">create</a> <a href="/update?id=${queryData.id}">update</a>`;
            var body = `
              <form action="/update_process" method="post">
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
            response.writeHead(200);
            response.end(html);
          });
        });
    } else if(pathname === '/update_process'){//topic을 update해주는 프로세스
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            db.query(`UPDATE topic SET title=?, description=?, created=NOW() WHERE id = ?`, [title, description, id], function(error, result){
              throwError(error);
              response.writeHead(302, {Location: `/?id=${id}`});
              response.end();
            });
        });
    } else if(pathname === '/delete_process'){//topic을 delete 해주는 프로세스
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            db.query(`DELETE FROM topic WHERE id=?`, [id], function(error, result){
              response.writeHead(302, {Location: `/`});
              response.end();
            })
        });
    } else if(pathname === '/author'){
        db.query('SELECT * FROM topic', function(error, topics){
          throwError(error);
          db.query('SELECT * FROM author', function(error2, authors){
            throwError(error2);
            var title = 'Authors page';
            var list = template.list(topics);
            var authorTable = template.getAuthorTable(authors);
            var body = `<h2>${title}</h2> ${authorTable}`;
            var control = `<a href="/author_create">create</a>`;
            var html = template.HTML(title, list, body, control);
            response.writeHead(200);
            response.end(html);
          });
        });
    } else if(pathname === '/author_create'){
        db.query('SELECT * FROM topic', function(error, topics){
          throwError(error);
          db.query('SELECT * FROM author', function(error2, authors){
            throwError(error2);
            var title = 'create author';
            var list = template.list(topics);
            var body = `
              <h2>${title}</h2> 
              <form action="/author_create_process" method="post">
                <p><input type="text" name="author_name" placeholder="name"></p>
                <p><textarea name="author_profile" placeholder="profile"></textarea></p>
                <p><input type="submit" value="create"></p>
              </form>
            `;
            var control = ``;
            var html = template.HTML(title, list, body, control);
            response.writeHead(200);
            response.end(html);
          });
        });
    } else if(pathname === '/author_create_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
          var post = qs.parse(body);
          var name = post.author_name;
          var profile = post.author_profile;
          db.query(`INSERT INTO author (name, profile) VALUES (?, ?)`, [name, profile], 
            function(error, results){
              throwError(error);
              response.writeHead(302, {Location: `/author`});
              response.end();
            });
        }); 
    } else if(pathname === '/author_update'){
        db.query(`SELECT * FROM topic`, function(error, topics){
          throwError(error);
          db.query(`SELECT * FROM author WHERE id = ?`, [queryData.id], function(error2, author){
            throwError(error2);
            var title = 'update author';
            var list = template.list(topics);
            var control = ``;
            var body = `
              <h2>${title}</h2>
              <form action="/author_update_process" method="post">
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
            var html = template.HTML(title, list, body, control);
            response.writeHead(200);
            response.end(html);
          });
        });
    } else if(pathname === '/author_update_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.author_id;
            var name = post.author_name;
            var profile = post.author_profile;
            db.query(`UPDATE author SET name=?, profile=? WHERE id = ?`, [name, profile, id], function(error, result){
              throwError(error);
              response.writeHead(302, {Location: `/author`});
              response.end();
            });
        });
    } else if(pathname === '/author_delete_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.author_id;
            db.query(`DELETE FROM author WHERE id=?`, [id], function(error, result){
              throwError(error);
              response.writeHead(302, {Location: `/author`});
              response.end();
            })
        });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
