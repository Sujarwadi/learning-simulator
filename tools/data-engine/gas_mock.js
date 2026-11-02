// Mock minimal Google Apps Script untuk menguji TNA.gs di Node. Data sintetis saja.
const fs = require('fs');
const vm = require('vm');

function makeSheet(name) {
  const sh = {
    name, data: [],
    _ensure(r, c) { while (this.data.length < r) this.data.push([]); for (const row of this.data) while (row.length < c) row.push(''); },
    getName() { return this.name; }, setName(n) { this.name = n; },
    getLastRow() { let n = this.data.length; while (n > 0 && this.data[n - 1].every(x => x === '' || x === null)) n--; return n; },
    getLastColumn() { return Math.max(0, ...this.data.map(r => { let n = r.length; while (n > 0 && (r[n - 1] === '' || r[n - 1] === null)) n--; return n; })); },
    getRange(r, c, nr = 1, nc = 1) { const s = this; return {
      getValues() { s._ensure(r + nr - 1, c + nc - 1); return s.data.slice(r - 1, r - 1 + nr).map(row => row.slice(c - 1, c - 1 + nc)); },
      getValue() { return this.getValues()[0][0]; },
      setValues(v) { if (v.length !== nr || v[0].length !== nc) throw new Error(`setValues dim ${v.length}x${v[0].length} != ${nr}x${nc} on ${s.name}`);
        s._ensure(r + nr - 1, c + nc - 1); v.forEach((row, i) => row.forEach((x, j) => { s.data[r - 1 + i][c - 1 + j] = x; })); return this; },
      setValue(x) { s._ensure(r, c); s.data[r - 1][c - 1] = x; return this; },
      clearContent() { s._ensure(r + nr - 1, c + nc - 1); for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) s.data[r - 1 + i][c - 1 + j] = ''; return this; },
      setFontWeight() { return this; }, setNumberFormat() { return this; }, setBackground() { return this; }, setFontColor() { return this; }, createFilter() { return this; }, merge() { return this; },
    }; },
    getDataRange() { const lr = Math.max(1, this.getLastRow()), lc = Math.max(1, this.getLastColumn()); return this.getRange(1, 1, lr, lc); },
    appendRow(row) { const lr = this.getLastRow(); this._ensure(lr + 1, row.length); row.forEach((x, j) => { this.data[lr][j] = x; }); },
    setFrozenRows() {}, deleteRow(i) { this.data.splice(i - 1, 1); },
  };
  return sh;
}
function makeSS(name) {
  const sheets = [makeSheet('Sheet1')];
  return { name, sheets, getName() { return name; }, getId() { return 'id-' + name; }, getUrl() { return 'https://docs.google.com/spreadsheets/d/id-' + encodeURIComponent(name); },
    getSheetByName(n) { return sheets.find(s => s.name === n) || null; },
    insertSheet(n) { const s = makeSheet(n || 'Sheet' + (sheets.length + 1)); sheets.push(s); return s; },
    getSheets() { return sheets; } };
}
const created = [];
const ACTIVE = makeSS('Learning Simulator DB');
const ctx = {
  SpreadsheetApp: { getActiveSpreadsheet: () => ACTIVE, create: (n) => { const s = makeSS(n); created.push(s); return s; }, openById: (id) => global.__IMPORT },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  Utilities: { formatDate: (d) => d.toISOString().slice(0, 16), sleep() {} },
  Session: { getScriptTimeZone: () => 'Asia/Makassar' },
  Logger: { log: (x) => console.log('[Logger]', x) },
  ScriptApp: { getProjectTriggers: () => [], newTrigger: () => ({ timeBased: () => ({ at: () => ({ create() {} }) }) }) },
  PALET: { navy: '#1F4E79' },
  wajibGantiPinAktif: (v) => v === true || String(v || '').toUpperCase() === 'TRUE',
  waitLockDenganRetry: () => {},
  console,
  CacheService: (() => { const store = {}; return { getScriptCache: () => ({
    get: (k) => (k in store ? store[k] : null), getAll: (ks) => Object.fromEntries(ks.filter(k => k in store).map(k => [k, store[k]])),
    put: (k, v) => { store[k] = String(v); }, remove: (k) => { delete store[k]; }, putAll: (o) => { Object.entries(o).forEach(([k, v]) => { if (String(v).length > 100000) throw new Error('cache item > 100KB'); store[k] = String(v); }); },
    _store: store }) }; })(),
  PropertiesService: (() => { const pr = {}; return { getScriptProperties: () => ({ getProperty: (k) => (k in pr ? pr[k] : null), setProperty: (k, v) => { pr[k] = String(v); } }) }; })(),
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[2], 'utf8'), ctx);
module.exports = { ctx, ACTIVE, makeSS, created };
