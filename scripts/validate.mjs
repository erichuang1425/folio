import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };

for (const file of ['newtab.js', 'popup.js', 'background.js', 'suspended.js', 'emoji-data.js']) {
  try { execFileSync(process.execPath, ['--check', resolve(root, file)], { stdio: 'pipe' }); }
  catch (error) { failures.push(`${file}: syntax check failed\n${error.stderr?.toString() || error.message}`); }
}

try {
  const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'));
  check(manifest.manifest_version === 3, 'manifest_version must be 3');
  check(manifest.version === '3.1.1', 'manifest version must be 3.1.1');
  check(!manifest.host_permissions?.length, 'host permissions are not allowed');
} catch (error) { failures.push(`manifest.json: ${error.message}`); }

let baseKeys;
for (const locale of ['en', 'zh_TW', 'zh_CN', 'es', 'ja', 'fr']) {
  try {
    const messages = JSON.parse(readFileSync(resolve(root, '_locales', locale, 'messages.json'), 'utf8'));
    const keys = Object.keys(messages).sort();
    baseKeys ||= keys;
    check(JSON.stringify(keys) === JSON.stringify(baseKeys), `${locale}: manifest message keys differ`);
    for (const [key, value] of Object.entries(messages)) check(value.message?.trim(), `${locale}: ${key} is empty`);
  } catch (error) { failures.push(`${locale} messages: ${error.message}`); }
}

const js = readFileSync(resolve(root, 'newtab.js'), 'utf8');
const found = js.match(/(const I18N = [\s\S]*?)\n\nfunction tr/);
if (!found) failures.push('could not locate I18N table');
else {
  try {
    const tables = Function(`"use strict"; ${found[1]}; return I18N;`)();
    const keys = Object.keys(tables.en).sort();
    for (const locale of ['en', 'zh-TW', 'zh-CN', 'es', 'ja', 'fr']) {
      check(tables[locale], `missing ${locale} application locale`);
      if (tables[locale]) check(JSON.stringify(Object.keys(tables[locale]).sort()) === JSON.stringify(keys), `${locale}: application keys differ`);
    }
    const html = readFileSync(resolve(root, 'newtab.html'), 'utf8');
    for (const match of html.matchAll(/data-i18n(?:-title|-placeholder|-aria-label)?="([^"]+)"/g)) check(keys.includes(match[1]), `missing English key ${match[1]}`);
  } catch (error) { failures.push(`I18N table: ${error.message}`); }
}

for (const htmlName of ['newtab.html', 'popup.html', 'suspended.html', 'docs/index.html']) {
  const file = resolve(root, htmlName);
  const html = readFileSync(file, 'utf8');
  check(!html.includes('\uFFFD'), `${htmlName}: replacement character found`);
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const ref = match[1];
    if (/^(?:https?:|data:|mailto:|chrome:|edge:)/.test(ref) || ref.startsWith('/')) continue;
    check(existsSync(resolve(dirname(file), ref.split('?')[0])), `${htmlName}: missing ${ref}`);
  }
}

if (failures.length) {
  console.error(`Validation failed (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('Validation passed: syntax, manifest, locales, i18n keys, encoding, and assets.');
