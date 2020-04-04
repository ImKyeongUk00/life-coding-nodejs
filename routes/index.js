var express = require('express');
var router = express.Router();
var db = require('../lib/db.js'); 
var template = require('../lib/template.js');

router.get('/', function(request, response){
    var title = 'Welcome';
    var description = 'Hello, Express';
    var list = template.list(request.topics);
    var body = `<h2>${title}</h2>${description}`;
    var control = `<a href="/topic/create">create</a>`
    var html = template.HTML(title, list, body, control);
    response.send(html);
});

module.exports = router;