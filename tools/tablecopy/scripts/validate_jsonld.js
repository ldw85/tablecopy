#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function loadHtml(filePath){
  try{ return fs.readFileSync(filePath, 'utf8'); }catch(e){ console.error('ERROR: cannot read', filePath, e.message); process.exit(2); }
}

function extractJsonLdBlocks(html){
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const out = [];
  let m;
  while((m = re.exec(html)) !== null){
    out.push(m[1].trim());
  }
  return out;
}

function parseJsonSafe(txt){
  try{ return JSON.parse(txt); }catch(e){
    // try to recover common issues: remove trailing commas
    try{
      const cleaned = txt.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(cleaned);
    }catch(err){ return {__parseError: e.message}; }
  }
}

function extractVisibleFAQQuestions(html){
  // Very small heuristic: collect text inside #faq h3, .faq-item h3, summary, and question-like headings
  const questions = new Set();
  const reH3 = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  const reSummary = /<summary[^>]*>([\s\S]*?)<\/summary>/gi;
  let m;
  while((m = reH3.exec(html)) !== null){
    const txt = m[1].replace(/<[^>]+>/g,'').trim();
    if(txt) questions.add(txt);
  }
  while((m = reSummary.exec(html)) !== null){
    const txt = m[1].replace(/<[^>]+>/g,'').trim();
    if(txt) questions.add(txt);
  }
  return Array.from(questions);
}

function extractDataLangKeys(html){
  const re = /data-lang-key=["']([^"']+)["']/gi;
  const keys = new Set();
  let m;
  while((m = re.exec(html)) !== null){ keys.add(m[1]); }
  return Array.from(keys);
}

function extractTcTranslationsObject(html){
  const marker = 'const tcTranslations';
  const idx = html.indexOf(marker);
  if(idx === -1) return null;
  const sub = html.slice(idx + marker.length);
  const eq = sub.indexOf('=');
  if(eq === -1) return null;
  const rest = sub.slice(eq+1);
  // find the balanced braces for the object
  let i = 0; while(i < rest.length && rest[i].trim && rest[i].trim() === '') i++;
  const start = rest.indexOf('{');
  if(start === -1) return null;
  let depth = 0; let end = -1;
  for(let j = start; j < rest.length; j++){
    const ch = rest[j];
    if(ch === '{') depth++; if(ch === '}') depth--; if(depth === 0){ end = j; break; }
  }
  if(end === -1) return null;
  const objText = rest.slice(start, end+1);
  try{
    // Use Function to evaluate the object literal safely in isolation
    const fn = new Function('return (' + objText + ');');
    return fn();
  }catch(e){ return null; }
}

function flattenGraph(obj){ if(!obj) return []; if(Array.isArray(obj)) return obj; if(obj['@graph']) return obj['@graph']; return [obj]; }

function validateSoftwareApplication(item){
  const errors = [];
  if(item['@type'] !== 'SoftwareApplication') errors.push('Not type SoftwareApplication');
  if(!item.name) errors.push('Missing name');
  if(!item.url) errors.push('Missing url');
  if(!item.author) errors.push('Missing author');
  return errors;
}

function validateFAQPage(item){
  const errors = [];
  if(item['@type'] !== 'FAQPage') errors.push('Not type FAQPage');
  const me = item.mainEntity;
  if(!Array.isArray(me)) { errors.push('mainEntity is not an array'); return errors; }
  me.forEach((q, idx)=>{
    if(q['@type'] !== 'Question') errors.push(`mainEntity[${idx}].type != Question`);
    if(!q.name) errors.push(`mainEntity[${idx}].name missing`);
    if(!q.acceptedAnswer || !q.acceptedAnswer['@type'] || !q.acceptedAnswer.text) errors.push(`mainEntity[${idx}].acceptedAnswer missing or malformed`);
  });
  return errors;
}

function validateFile(filePath){
  console.log(`\n== Validating ${filePath}`);
  const html = loadHtml(filePath);
  const visible = extractVisibleFAQQuestions(html);
  console.log('Found visible FAQ questions:', visible.length);
  // if a language was requested via global LANG_OPTION, try to build expected localized questions
  let localizedExpected = null;
  if(typeof global !== 'undefined' && global.LANG_OPTION){
    const tc = extractTcTranslationsObject(html);
    if(tc && tc[global.LANG_OPTION]){
      // collect keys that appear in the DOM and map to translations
      const keys = extractDataLangKeys(html);
      localizedExpected = keys.map(k => tc[global.LANG_OPTION][k]).filter(Boolean);
      console.log(`Using ${localizedExpected.length} localized strings from tcTranslations for lang ${global.LANG_OPTION}`);
    } else {
      console.log('No tcTranslations object found or missing language');
    }
  }
  const blocks = extractJsonLdBlocks(html);
  if(blocks.length === 0){ console.warn('WARN: no application/ld+json blocks found'); return {file: filePath, ok: false, errors: ['no-jsonld'], visible}; }
  const errors = [];
  blocks.forEach((txt, bi)=>{
    const parsed = parseJsonSafe(txt);
    if(parsed.__parseError){ errors.push(`JSON-LD parse error in block ${bi}: ${parsed.__parseError}`); return; }
    const nodes = flattenGraph(parsed);
    nodes.forEach((n)=>{
      if(n['@type'] === 'SoftwareApplication'){
        const e = validateSoftwareApplication(n);
        if(e.length) errors.push(...e.map(m=>`SoftwareApplication: ${m}`));
      }
      if(n['@type'] === 'FAQPage'){
        const e = validateFAQPage(n);
        if(e.length) errors.push(...e.map(m=>`FAQPage: ${m}`));
        const names = (n.mainEntity||[]).map(q=>q.name && q.name.trim()).filter(Boolean);
        names.forEach(name=>{
          if(localizedExpected){
            // if localized expected list available, check there
            if(!localizedExpected.includes(name) && !visible.includes(name)) errors.push(`FAQ mismatch: JSON-LD question not found in localized page or visible DOM: "${name}"`);
          } else {
            if(!visible.includes(name)) errors.push(`FAQ mismatch: JSON-LD question not found in page: "${name}"`);
          }
        });
      }
    });
  });
  const ok = errors.length === 0;
  if(ok) console.log('OK: no issues detected'); else console.warn('Issues:', errors);
  return {file: filePath, ok, errors, visible};
}

function main(){
  const raw = process.argv.slice(2);
  if(raw.length === 0){ console.log('Usage: node validate_jsonld.js [--lang=xx] <file1.html> <file2.html> ...'); process.exit(1); }
  const args = [];
  raw.forEach(arg => {
    if(arg.startsWith('--lang=')){
      global.LANG_OPTION = arg.split('=')[1];
    } else if(arg === '--lang'){
      // next arg is lang
    } else {
      args.push(arg);
    }
  });
  if(!args.length){ console.log('No files specified.'); process.exit(1); }
  const results = args.map(a=> validateFile(path.resolve(a)) );
  console.log('\nSummary:');
  results.forEach(r=>{ console.log(`- ${r.file}: ${r.ok ? 'PASS' : 'FAIL'}${r.errors && r.errors.length ? ' - ' + r.errors.length + ' issue(s)' : ''}`); });
  const failed = results.filter(r=>!r.ok).length;
  process.exit(failed ? 3 : 0);
}

main();
