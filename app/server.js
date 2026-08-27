/* Servidor estatico minimo para el kiosco (sin dependencias).
   Uso:  node server.js     ->  http://localhost:5173  */
const http=require('http'),fs=require('fs'),path=require('path');
const T={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.otf':'font/otf','.ttf':'font/ttf'};
http.createServer((rq,rs)=>{
  let p=decodeURIComponent(rq.url.split('?')[0]);
  if(p==='/')p='/index.html';
  const f=path.join(__dirname,p);
  if(!f.startsWith(__dirname)){rs.writeHead(403).end();return;}
  fs.readFile(f,(e,d)=>{
    if(e){rs.writeHead(404,{'Content-Type':'text/plain'}).end('404');return;}
    rs.writeHead(200,{'Content-Type':T[path.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});
    rs.end(d);
  });
}).listen(5173,()=>console.log('Conexiones que importan -> http://localhost:5173'));
