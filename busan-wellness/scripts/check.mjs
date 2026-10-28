import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const dir of ['api','lib','public','scripts']) for(const file of await readdir(new URL(`../${dir}/`,import.meta.url))) if(/\.m?js$/.test(file)) {const r=spawnSync(process.execPath,['--check',`${root}/${dir}/${file}`],{encoding:'utf8'});if(r.status) throw new Error(r.stderr);}
for(const f of ['index.html','style.css','app.js']) await readFile(new URL(`../public/${f}`,import.meta.url));
console.log('Build validation passed: JavaScript syntax, public assets and Vercel source ready.');
