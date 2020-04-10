var sanitizeHtml = require('sanitize-html');

module.exports = {
  HTML:function(title, list, body, control, authStatusUI){
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      ${authStatusUI}
      <h1><a href="/">WEB</a></h1>
      <a href="/author">author</a>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },
  list:function(topics){
    var list = '<ul>';
    var i = 0;
    while(i < topics.length){
      list = list + `<li><a href="/topic/${topics[i].id}">${sanitizeHtml(topics[i].title)}</a></li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  },
  selectAuthor: function(authors){
    var select = `<select name="author_id">`;
    var i = 0;

    while(i<authors.length){
      select = select +  `<option value="${authors[i].id}">${authors[i].name}</option>`;
      i++;
    }

    select = select + `</select>`;
    return select;
  },
  getAuthorTable: function(authors){
    var table = `<table border="1">`;
    var i = 0;

    while(i<authors.length){
      table = table + `
        <tr>
          <th>${authors[i].name}</th> 
          <td>${authors[i].profile}</td> 
          <td><a href="/author/update/${authors[i].id}">update</a></td>
          <td>
            <form action="/author/delete_process" method="post">
              <input type="hidden" value="${authors[i].id}" name="author_id">
              <input type="submit" value="delete">
            </form>
          </td>
        </tr>
      `;

      i++;
    }
    table = table + `</table>`;
    return table;
  }
}
