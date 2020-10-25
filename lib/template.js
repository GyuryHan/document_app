const template = {
  html: function(title, list, body, control) {
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
  }, 
  list: function(files) {
      let list = '<ul>';
      let i = 0;
      while(i < files.length) {
        list = list + `<li><a href="/?id=${files[i]}">${files[i]}</a></li>`
        i += 1;
      }
      list = list + '</ul>';
      return list;
  }
}

module.exports = template;