const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const ASIDE = process.env.ASIDE_EXE || path.join(process.env.LOCALAPPDATA, 'Aside', 'CLI', 'current', 'aside.exe');
const key = process.argv[2];
const body = fs.readFileSync(path.join(__dirname, 'channels', key + '.js'), 'utf8').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('//')).join(' ');
const r = spawnSync(ASIDE, ['repl'], { input: body + '\n', encoding: 'utf8', timeout: 150000 });
console.log(key, ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /@@JSON|rror/.test(l)).join('\n').slice(0, 800));
