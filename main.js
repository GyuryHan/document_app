const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');
//보안
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const app = http.createServer(function(request,response){
    const _url = request.url;
    const queryData = url.parse(_url, true).query;
    const pathname = url.parse(_url, true).pathname;  
    if(pathname === '/') {
      if(queryData.id === undefined) {
          fs.readdir('./data', (err, files) => {
            const title ='Hi! :-D'
            description = "Hi, Node.js";

            let list = template.list(files);
            const html = template.html(title, list, 
              `<h2>${title}</h2><p>${description}</p>`, 
              `<a href="/create">create</a>`);
            response.writeHead(200);
            response.end(html);
          });
      } else {
          fs.readdir('./data', (err, files) => {
            const filteredId = path.parse(queryData.id).base;   // 보안코드
            fs.readFile(`data/${filteredId}`, 'utf8', (err, description) => {  //파일 읽는 방법
              const title = queryData.id;
              const sanitizedTitle = sanitizeHtml(title);               // 아래와 동일
              const sanitizedDescription = sanitizeHtml(description, {  // 사용자가 입력한 html코드(<h1>,<div>등) 삭제하여 보완, <script> 문자 제거
                allowedTags: ['h1']    // h1태그는 허용하겠다.
              }); 
              let list = template.list(files);
              const html = template.html(sanitizedTitle, list, 
                `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
                  `<a href="/create">create</a> 
                  <a href="/update?id=${sanitizedTitle}">update</a>
                  <form action="/delete_process" method="post" onsubmit="return confirm('do you want to delete this file?')">
                    <input type="hidden" name="id" value="${sanitizedTitle}">
                    <input type="submit" value="delete">
                  </form>`
                );
              response.writeHead(200);
              response.end(html);
            }); 
        }); 
      }
    } else if(pathname === '/create') {
      fs.readdir('./data', (err, files) => {
        const title ='WEB - create'
        let list = template.list(files);
        const html = template.html(title, list, `
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
        response.end(html);
      })
    } else if(pathname === '/create_process') {
      let body = '';
      request.on('data', function(data) {
        body += data;
        // if (body.length > 1e6)
        // request.connection.destroy();  데이터가 많으면 접속 끊는 코드
      });
      request.on('end', function() {
        const post = qs.parse(body);  // console.log(post) => { title: 'NodeJS', description: 'Node.js is..' }
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
        const filteredId = path.parse(queryData.id).base; 
        fs.readFile(`data/${filteredId}`, 'utf8', (err, description) => {
          const title = queryData.id;
          let list = template.list(files);
          const html = template.html(title, list, 
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
          response.end(html);
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
        const filteredId = path.parse(id).base; 

        console.log("post", post);
        fs.unlink(`data/${filteredId}`, (err) => {
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

