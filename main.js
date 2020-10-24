const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');

function templateHTML(title, list, body, control) {
  return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB2</a></h1>
      ${list}
      ${control}
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
            const template = templateHTML(title, list, 
              `<h2>${title}</h2><p>${description}</p>`, 
              `<a href="/create">create</a>`);
            response.writeHead(200);
            response.end(template);
          })
      } else {
          fs.readdir('./data', (err, files) => {
          fs.readFile(`data/${queryData.id}`, 'utf8', (err, description) => {
            const title = queryData.id;
            let list = templateList(files);
            const template = templateHTML(title, list, 
              `<h2>${title}</h2><p>${description}</p>`,
                `<a href="/create">create</a> 
                <a href="/update?id=${title}">update</a>
                <form action="/delete_process" method="post" onsubmit="return confirm('do you want to delete this file?')">
                  <input type="hidden" name="id" value="${title}">
                  <input type="submit" value="delete">
                </form>`
              );
            response.writeHead(200);
            response.end(template);
          }); 
        }); 
      }
    } else if(pathname === '/create') {
      fs.readdir('./data', (err, files) => {
        const title ='WEB - create'
        let list = templateList(files);
        const template = templateHTML(title, list, `
        <form action="/create_process" method="post">   
          <div>
            <input type="text" name="title" placeholder="title">
          </div>
          <div>
            <textarea name="description" placeholder="description"></textarea>
          </div>
          <div>  
            <input type="submit">
          </div>
        </form>
        `, '');
        response.writeHead(200);
        response.end(template);
      })
    } else if(pathname === '/create_process') {
      let body = '';
      request.on('data', function(data) {
        body += data;
        // if (body.length > 1e6)
        // request.connection.destroy();  데이터가 많으면 접속 끊는 코드
      });
      request.on('end', function() {
        const post = qs.parse(body);  //let?!!!  console.log(post) => { title: 'NodeJS', description: 'Node.js is..' }
        const title = post.title;
        const description = post.description;

        fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
          // 302: Page redirection
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        });
      });
    } else if(pathname === '/update') {
      fs.readdir('./data', (err, files) => {
        fs.readFile(`data/${queryData.id}`, 'utf8', (err, description) => {
          const title = queryData.id;
          let list = templateList(files);
          const template = templateHTML(title, list, 
            `
            <form action="/update_process" method="post">   
              <input type="hidden" name="id" value="${title}">  
              <div>
                <input type="text" name="title" placeholder="title" value="${title}">
              </div>
              <div>
                <textarea name="description" placeholder="description">${description}</textarea>
              </div>
              <div>  
                <input type="submit">
              </div>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
          response.writeHead(200);
          response.end(template);
        }); 
      }); 
    } else if(pathname === '/update_process') {
      let body = '';
      request.on('data', function(data) {
        body += data;
        // if (body.length > 1e6)
        // request.connection.destroy();  데이터가 많으면 접속 끊는 코드
      });
      request.on('end', function() {
        const post = qs.parse(body);  // console.log(post) => { title: , description: }
        const id = post.id;
        const title = post.title;
        const description = post.description;
    
        fs.rename(`data/${id}`, `data/${title}`, err => {      // 파일이름수정: fs.rename(oldFath, newPath, callback)
          fs.writeFile(`data/${title}`, description, 'utf8', (err) => {    
            response.writeHead(302, { Location: `/?id=${title}` });   // 302: 페이지 리다이렉션
            response.end();
          });
        });
      });
    } else if(pathname === '/delete_process') {
      let body = '';
      request.on('data', function(data) {
        body += data;
      });
      request.on('end', function() {
        const post = qs.parse(body);  
        const id = post.id;
        console.log("post", post);
        fs.unlink(`data/${id}`, (err) => {
          response.writeHead(302, { Location: `/` });   // 302: 페이지 리다이렉션, 삭제끝나면 홈으로 보냄
          response.end();
        });  
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);

