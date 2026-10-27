import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const [out, name, ...steps] = process.argv.slice(2);
const seed = JSON.parse(readFileSync('e2e/fixtures/athlete.json', 'utf8'));
const extra = process.env.SEED_EXTRA ? JSON.parse(process.env.SEED_EXTRA) : {};
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errs=[]; p.on('pageerror', e => errs.push(String(e)));
await p.goto('http://localhost:4174/');
await p.evaluate(d => localStorage.setItem('7bit_store', JSON.stringify({ state: d, version: 2 })), { ...seed.data, ...extra });
await p.reload(); await p.waitForTimeout(700);
for (const st of steps) {
  const [kind, val] = st.split('=');
  if (kind === 'tab') await p.getByRole('tab', { name: val, exact: true }).first().click();
  else if (kind === 'btn') await p.getByRole('button', { name: new RegExp(val) }).first().click();
  else if (kind === 'text') await p.getByText(val).first().click();
  else if (kind === 'scroll') await p.getByText(val).first().scrollIntoViewIfNeeded();
  await p.waitForTimeout(350);
}
await p.addStyleTag({ content: 'nav, [class*=TabBar], [class*=tabBar] { display:none !important }' });
await p.screenshot({ path: `${out}/${name}.png`, fullPage: true });
console.log(name, errs.length ? errs : 'no errors');
await b.close();
