var mysql = require('mysql');

var db = mysql.createConnection({
  host:'',
  user:'',
  password:'',
  database:''
});

module.exports = db;