import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import handler from '../api/explore.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const publicRoot=resolve(root,'public');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
  try {
    // Reload after key registration, without printing or serving the file.
    for(const name of ['TOUR_API_KEY','BUSAN_FESTIVAL_API_KEY']) delete process.env[name];
    try {process.loadEnvFile(resolve(root,'.env'));} catch {}
    const url=new URL(req.url,'http://localhost');
    res.status=n=>{res.statusCode=n;return res;};res.json=data=>{res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data));};
    res.setHeader('X-Content-Type-Options','nosniff');
    if(url.pathname==='/api/explore') return await handler(req,res);
    const path=resolve(publicRoot,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!path.startsWith(publicRoot+sep) || url.pathname.split('/').some(p=>p.startsWith('.'))) {res.statusCode=404;return res.end('Not found');}
    if(!(await stat(path)).isFile()) throw new Error();
    res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');
    res.end(await readFile(path));
  } catch {res.statusCode=404;res.end('Not found');}
});
server.listen(Number(process.env.PORT||3210),'127.0.0.1',()=>console.log('Busan Slowwave: http://localhost:'+(process.env.PORT||3210)));
