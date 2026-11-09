// Validate syntax, Schema.org domains/ranges, references and source fidelity.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const files = ['index.html','about.html','report.html','contents.html','sns.html','final.html','admin.html','projects/frame/index.html'];
const base = 'https://kimjuncheol-ai.github.io/portfolio/';
const array = x => x == null ? [] : Array.isArray(x) ? x : [x];
const id = value => value.includes(':') ? value.replace('https://schema.org/', 'schema:') : 'schema:' + value;
const git = (...args) => execFileSync('git', ['-c','safe.directory='+root.replaceAll('\\','/'),...args], { cwd: root, encoding: 'utf8' });
const errors = [];
const compareHead = process.argv.includes('--compare-head');
const vocabularyPath = process.argv.slice(2).find(value => !value.startsWith('--'));
const fail = (where, message) => errors.push(where + ': ' + message);

(async () => {
  let vocabulary;
  if (vocabularyPath) vocabulary = JSON.parse(fs.readFileSync(vocabularyPath, 'utf8'));
  else {
    const response = await fetch('https://schema.org/version/latest/schemaorg-current-https.jsonld');
    if (!response.ok) throw new Error('Schema.org vocabulary unavailable: '+response.status);
    vocabulary = await response.json();
  }
  const terms = new Map(vocabulary['@graph'].map(x => [x['@id'], x]));
  const ancestry = (type, seen = new Set()) => {
    const key = id(type);
    if (seen.has(key)) return seen;
    seen.add(key);
    array(terms.get(key)?.['rdfs:subClassOf']).forEach(p => ancestry(p['@id'], seen));
    return seen;
  };
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const page = await browser.newPage();
  await page.route('**/*',r=>r.abort());
  const results = [];
  for (const file of files) {
    const html = fs.readFileSync(path.join(root,file),'utf8');
    if (compareHead) {
      const baseline = git('show','HEAD:'+file);
      assert.equal(html.slice(html.indexOf('<body')).replaceAll('\r\n','\n'), baseline.slice(baseline.indexOf('<body')).replaceAll('\r\n','\n'), file+': visible markup changed');
    }
    const matches = [...html.matchAll(/<script id="page-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(matches.length,1,file+': expected one static JSON-LD block');
    const data = JSON.parse(matches[0][1]);
    assert.equal(data['@context'],'https://schema.org');
    const nodes = new Map(data['@graph'].map(x=>[x['@id'],x]));
    assert.equal(nodes.size,data['@graph'].length,file+': duplicate entity IDs');
    const check = (object, where) => {
      if (!object || typeof object !== 'object') return;
      if (!object['@type']) {
        if (object['@id'] && !nodes.has(object['@id'])) fail(where,'unresolved reference '+object['@id']);
        return;
      }
      const types = array(object['@type']);
      for (const type of types) if (!terms.has(id(type))) fail(where,'unknown type '+type);
      const ancestors = new Set(types.flatMap(t=>[...ancestry(t)]));
      for (const [property, value] of Object.entries(object)) {
        if (property.startsWith('@')) continue;
        const definition = terms.get('schema:'+property);
        if (!definition || !array(definition['@type']).includes('rdf:Property')) { fail(where,'unknown property '+property); continue; }
        const domains = array(definition['schema:domainIncludes']).map(d=>d['@id']);
        if (domains.length && !domains.some(d=>ancestors.has(d))) fail(where,property+' is not valid on '+types.join(','));
        const ranges = array(definition['schema:rangeIncludes']).map(r=>r['@id']);
        for (const entry of array(value)) {
          if (entry && typeof entry==='object') {
            const target = entry['@type'] ? entry : nodes.get(entry['@id']);
            if (target) {
              const inherited = new Set(array(target['@type']).flatMap(t=>[...ancestry(t)]));
              if (ranges.length && !ranges.some(r=>inherited.has(r))) fail(where,property+' has incompatible value type '+target['@type']);
            }
            check(entry,where+'/'+property);
          } else if (typeof entry==='string' && ranges.includes('schema:URL') && !ranges.includes('schema:Text')) {
            try { assert.equal(new URL(entry).protocol,'https:'); } catch { fail(where,property+' must be an absolute HTTPS URL'); }
          } else if (typeof entry==='number' && ranges.includes('schema:Integer')) {
            if (!Number.isInteger(entry)) fail(where,property+' must be an integer');
          }
          if (['datePublished','uploadDate'].includes(property) && !Number.isFinite(Date.parse(entry))) fail(where,property+' has an invalid date');
          if (property==='uploadDate' && !/T.*(?:Z|[+-]\d\d:\d\d)$/.test(entry)) fail(where,'uploadDate requires a verified time and timezone');
          if (property==='duration' && !/^PT\d+S$/.test(entry)) fail(where,'invalid video duration');
          if (['image','logo','thumbnailUrl','contentUrl'].includes(property) && typeof entry==='string' && entry.startsWith(base)) {
            if (!fs.existsSync(path.join(root,decodeURIComponent(new URL(entry).pathname.slice(new URL(base).pathname.length))))) fail(where,'missing local image '+entry);
          }
        }
      }
      if (types.includes('ItemList')) {
        assert.equal(object.numberOfItems,object.itemListElement.length,where+': list count mismatch');
        object.itemListElement.forEach((item,i)=>assert.equal(item.position,i+1));
      }
      if (types.includes('VideoObject')) for (const required of ['name','description','thumbnailUrl','uploadDate']) assert(object[required],where+': missing '+required);
    };
    data['@graph'].forEach(n=>check(n,file+' '+n['@id']));
    await page.setContent(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''),{waitUntil:'domcontentloaded'});
    const source = await page.evaluate(()=>({tours:[...document.querySelectorAll('[data-resource-key]')].map(c=>({key:c.dataset.resourceKey,name:c.querySelector('h2').textContent.trim(),description:c.querySelector('[data-api-intro]').textContent.trim(),address:c.querySelector('[data-api-address]').textContent.trim()})),projects:[...document.querySelectorAll('.project-entry h3')].map(e=>e.textContent.trim()),shorts:[...document.querySelectorAll('.short-card')].map(e=>({name:e.querySelector('h3').textContent.trim(),date:e.querySelector('time').getAttribute('datetime')})),cards:document.querySelectorAll('.cardnews-series').length,channels:[...document.querySelectorAll('.channel-card')].map(e=>e.getAttribute('href')),robots:document.querySelector('meta[name="robots"]')?.content,canonical:document.querySelector('link[rel="canonical"]')?.getAttribute('href')}));
    for (const tour of source.tours) {
      const node = [...nodes.values()].find(n=>n['@id'].endsWith('#resource-'+tour.key));
      assert.equal(node.name,tour.name);assert.equal(node.description,tour.description);assert.equal(node.address.streetAddress,tour.address);
    }
    for (const name of source.projects) assert([...nodes.values()].some(n=>n.name===name));
    for (const short of source.shorts) {
      const node = [...nodes.values()].find(n=>n.name===short.name && n['@type']==='VideoObject');
      assert(node,'Missing verified video metadata: '+short.name);
      assert.equal(new Date(node.uploadDate).toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'}),short.date);
    }
    if (file==='sns.html') assert.deepEqual(nodes.get(base+'sns.html#brand').sameAs,source.channels);
    if (file==='admin.html') { assert.equal(source.robots,'noindex,nofollow');assert.equal(data['@graph'].length,1); }
    else assert.equal(source.canonical,file==='index.html'?base:base+file);
    results.push({file,entities:nodes.size,tours:source.tours.length,projects:source.projects.length,shorts:source.shorts.length,...(compareHead?{bodyUnchanged:true}:{})});
  }
  if (compareHead) for (const file of ['style.css','script.js']) assert.equal(fs.readFileSync(path.join(root,file),'utf8').replaceAll('\r\n','\n'),git('show','HEAD:'+file).replaceAll('\r\n','\n'),file+' changed');
  await browser.close();
  console.log(JSON.stringify({pages:results,errors},null,2));
  assert.equal(errors.length,0,'Schema.org validation errors: '+errors.length);
})().catch(e=>{console.error(e);process.exit(1);});
