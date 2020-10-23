const http = require('http');
const fs = require('fs');
const url = require('url');

function templateHTML(title, list, body) {
  return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${body}
    </body>
    </html>
    `;
}

function templateList(files) {
    let list = '<ul>';
    let i = 0;
    while(i < files.length) {
      list = list + `<li><a href="/?id=${files[i]}">${files[i]}</a></li>`
      i += 1;
    }
    list = list + '</ul>';
    return list;
}

const app = http.createServer(function(request,response){
    const _url = request.url;
    const queryData = url.parse(_url, true).query;
    const pathname = url.parse(_url, true).pathname;  
   
    if(pathname === '/') {
      if(queryData.id === undefined) {
          fs.readdir('./data', (err, files) => {
            const title ='Hi! :-D'
            description = "Hi, Node.js";
            let list = templateList(files);
            const template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`);
            response.writeHead(200);
            response.end(template);
          })
      } else {
          fs.readdir('./data', (err, files) => {
          fs.readFile(`data/${queryData.id}`, 'utf8', (err, description) => {
            const title = queryData.id;
            let list = templateList(files);
            const template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`);
            response.writeHead(200);
            response.end(template);
          }); 
        }); 
      }
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);