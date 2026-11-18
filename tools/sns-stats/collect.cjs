// Collects Artour Busan channel stats through the signed-in Aside browser (no platform APIs),
// writes assets/data/sns-stats.json and appends one snapshot per day to assets/data/sns-history.json.
// Usage: node tools/sns-stats/collect.cjs [--push]
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ASIDE = process.env.ASIDE_EXE || 'C:/Users/user/Documents/Codex/2026-10-14/aside-instagram-youtube-facebook-page-x/work/aside-cli/current/aside.exe';
const DATA = path.join(ROOT, 'assets', 'data');
const CHANNELS = [
  { key: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/artour_busan/', followersLabel: '팔로워', viewsBasis: '릴스 누적' },
  { key: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61595298063187', followersLabel: '팔로워', viewsBasis: '최근 28일' },
  { key: 'x', name: 'X', url: 'https://x.com/artour_busan', followersLabel: '팔로워', viewsBasis: '불러온 게시물 누적' },
  { key: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/@artour_busan', followersLabel: '구독자', viewsBasis: '채널 누적' },
  { key: 'naver', name: 'Naver Blog', url: 'https://blog.naver.com/artour_busan', followersLabel: '이웃', viewsBasis: '11.2부터 일별 합산' },
];

// Runs one channel script in a fresh `aside repl` session and returns the JSON line it prints.
function runChannel(key) {
  const body = fs.readFileSync(path.join(__dirname, 'channels', `${key}.js`), 'utf8')
    .split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('//')).join(' ');
  const r = spawnSync(ASIDE, ['repl'], { input: body + '\n', encoding: 'utf8', timeout: 150000, maxBuffer: 16 * 1024 * 1024 });
  const line = (r.stdout || '').split(/\r?\n/).find(l => l.includes('@@JSON'));
  if (!line) throw new Error(((r.stdout || '') + (r.stderr || '')).replace(/\s+/g, ' ').slice(-300) || 'no output');
  return JSON.parse(line.slice(line.indexOf('@@JSON') + 6));
}

const kst = new Date(Date.now() + 9 * 3600e3);
const date = kst.toISOString().slice(0, 10);
const time = kst.toISOString().slice(11, 16);
const previous = fs.existsSync(path.join(DATA, 'sns-stats.json')) ? JSON.parse(fs.readFileSync(path.join(DATA, 'sns-stats.json'), 'utf8')) : null;

// Channels listed in skip.json are not visited (e.g. while an account is under review); they keep their last values.
const SKIP = fs.existsSync(path.join(__dirname, 'skip.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, 'skip.json'), 'utf8')) : [];
const historyFile = path.join(DATA, 'sns-history.json');
const history = fs.existsSync(historyFile) ? JSON.parse(fs.readFileSync(historyFile, 'utf8')) : [];

// Naver shows only per-day views, so each day's count is stored in history and the total is
// the views counted by hand up to 2026-11-17 plus every later day's count.
const NAVER_BASE = { through: '2026-11-17', views: 28 };
const yesterday = new Date(Date.parse(date) - 86400e3).toISOString().slice(0, 10);
function naverViews(stats) {
  const setDaily = (day, value) => {
    if (value == null) return;
    let entry = history.find(h => h.date === day);
    if (!entry) { entry = { date: day, channels: {} }; history.push(entry); }
    entry.channels.naver = { ...(entry.channels.naver || {}), dailyViews: value };
  };
  setDaily(date, stats.dailyViews);
  setDaily(yesterday, stats.dailyViewsYesterday);
  const counted = history.filter(h => h.date > NAVER_BASE.through && h.channels.naver?.dailyViews != null);
  return counted.length ? NAVER_BASE.views + counted.reduce((sum, h) => sum + h.channels.naver.dailyViews, 0) : null;
}

const channels = CHANNELS.map((channel) => {
  try {
    if (SKIP.includes(channel.key)) throw new Error('skipped (skip.json)');
    let stats;
    try { stats = runChannel(channel.key); } catch (first) {
      // The Aside daemon occasionally drops a session; wait and try once more.
      console.error(channel.key, 'retrying:', first.message.slice(0, 120));
      spawnSync(process.execPath, ['-e', 'setTimeout(() => {}, 15000)']);
      stats = runChannel(channel.key);
    }
    console.log(channel.key, JSON.stringify(stats));
    if (channel.key === 'naver') stats.views = naverViews(stats);
    // A metric the page did not show this time keeps its last known value instead of dropping to empty.
    const old = previous?.channels?.find(c => c.key === channel.key) || {};
    const kept = ['followers', 'posts', 'views'].filter(k => stats[k] == null && old[k] != null);
    kept.forEach((k) => { stats[k] = old[k]; });
    return { ...channel, ...stats, top: old.top ?? null, status: kept.length ? 'partial' : 'ok', ...(kept.length ? { kept } : {}) };
  } catch (error) {
    console.error(channel.key, 'failed:', error.message);
    // Keep the last known numbers so the dashboard still renders, but mark them as stale.
    const old = previous?.channels?.find(c => c.key === channel.key);
    return { ...channel, ...(old ? { followers: old.followers, posts: old.posts, views: old.views } : {}), status: 'stale', error: error.message.slice(0, 160) };
  }
});

const snapshot = { asOf: date, collectedAt: `${date} ${time} KST`, channels };
if (!channels.some(c => c.status !== 'stale')) {
  console.error('no channel could be read (is Aside running?) - nothing saved');
  process.exit(1);
}
fs.mkdirSync(DATA, { recursive: true });
fs.writeFileSync(path.join(DATA, 'sns-stats.json'), JSON.stringify(snapshot, null, 2) + '\n');

// Only channels read this run are recorded; a day keeps earlier readings for channels that failed.
const fresh = Object.fromEntries(channels.filter(c => c.status !== 'stale').map(c => [c.key, { followers: c.followers, views: c.views, posts: c.posts }]));
const at = history.findIndex(h => h.date === date);
if (at < 0) history.push({ date, channels: {} });
const today = history.find(h => h.date === date);
for (const [key, value] of Object.entries(fresh)) today.channels[key] = { ...(today.channels[key] || {}), ...value };
history.sort((a, b) => a.date.localeCompare(b.date));
fs.writeFileSync(historyFile, JSON.stringify(history, null, 2) + '\n');
console.log(`saved ${date} ${time} · ${channels.filter(c => c.status === 'ok').length}/${channels.length} channels ok`);

if (process.argv.includes('--push')) {
  const git = (...args) => spawnSync('git', ['-c', 'safe.directory=*', ...args], { cwd: ROOT, encoding: 'utf8' });
  git('add', 'assets/data/sns-stats.json', 'assets/data/sns-history.json');
  if (git('diff', '--cached', '--quiet').status !== 0) {
    git('commit', '-m', `chore: update SNS stats ${date}`);
    const push = git('push', 'origin', 'main');
    console.log(push.status === 0 ? 'pushed' : `push failed: ${push.stderr}`);
  } else {
    console.log('no changes to push');
  }
}
