#!/usr/bin/env node
// TUPEC — Inventory state manager (deterministic mutations for inventory.json)
//
// Subcommands:
//   init                    Create/ensure inventory.json with defaults
//   list [--json]           Render inventory (human or JSON)
//   add --title --desc --rationale --category [--deps] [--size]
//   chop <ids...> --reason "..."  [--force] [--dry-run]
//   lock [--force]          Set locked: true (with confirmation unless --force)
//   set-spec <id> --path <p> --branch <b> --status <success|skipped|failed> [--error "..."]
//
// All subcommands read/write .specify/tupec/inventory.json, preserve history[],
// validate IDs, exit with clear codes: 0=ok, 1=usage/error, 2=validation, 3=locked, 4=not-found.

import fs from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INVENTORY_DIR = path.join(process.cwd(), '.specify', 'tupec');
const INVENTORY_PATH = path.join(INVENTORY_DIR, 'inventory.json');
const INVENTORY_MD_PATH = path.join(INVENTORY_DIR, 'inventory.md');

const DEFAULTS = {
  version: 1,
  locked: false,
  scanDepth: 'exhaustive',
  targetPath: process.cwd(),
  scannedAt: null,
  features: [],
  unmapped: [],
  history: [],
  configSnapshot: {}
};

function now() { return new Date().toISOString(); }
function kebab(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

function loadInventory() {
  if (!existsSync(INVENTORY_PATH)) return { ...DEFAULTS };
  try {
    return JSON.parse(readFileSync(INVENTORY_PATH, 'utf8'));
  } catch {
    return { ...DEFAULTS };
  }
}

function saveInventory(inv) {
  writeFileSync(INVENTORY_PATH, JSON.stringify(inv, null, 2), 'utf8');
}

function ensureDir() {
  if (!existsSync(INVENTORY_DIR)) fs.mkdirSync(INVENTORY_DIR, { recursive: true });
}

function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { o[key] = next; i++; }
      else { o[key] = true; }
    } else if (a.startsWith('-')) {
      // short flags not used
      o[a.slice(1)] = true;
    } else {
      o._.push(a);
    }
  }
  return o;
}

function findFeature(inv, id) {
  const idx = inv.features.findIndex(f => f.id === id);
  return idx >= 0 ? { feature: inv.features[idx], index: idx } : null;
}

function nextFId(inv) {
  const nums = inv.features.filter(f => f.id.startsWith('F')).map(f => parseInt(f.id.slice(1), 10));
  return `F${String((Math.max(0, ...nums) || 0) + 1).padStart(3, '0')}`;
}

function nextAId(inv) {
  const nums = inv.features.filter(f => f.id.startsWith('A')).map(f => parseInt(f.id.slice(1), 10));
  return `A${String((Math.max(0, ...nums) || 0) + 1).padStart(3, '0')}`;
}

function expandRange(inv, range) {
  const m = range.match(/^([FA])(\d+)-([FA])(\d+)$/);
  if (!m) return null;
  const [, p1, n1, p2, n2] = m;
  if (p1 !== p2) return null;
  const start = parseInt(n1, 10), end = parseInt(n2, 10);
  if (start > end) return null;
  const ids = [];
  for (let n = start; n <= end; n++) {
    const id = `${p1}${String(n).padStart(3, '0')}`;
    if (inv.features.some(f => f.id === id)) ids.push(id);
  }
  return ids.length === (end - start + 1) ? ids : null;
}

function fuzzyMatch(inv, query) {
  const q = query.toLowerCase();
  return inv.features.filter(f => f.title.toLowerCase().includes(q));
}

function renderHuman(inv) {
  const kept = inv.features.filter(f => f.status === 'keep');
  const chopped = inv.features.filter(f => f.status === 'chopped');
  const added = inv.features.filter(f => f.origin === 'added');
  const byCat = {}; for (const f of inv.features) byCat[f.category] = (byCat[f.category] || 0) + 1;
  const broken = [];
  for (const f of kept) {
    for (const dep of f.dependencies || []) {
      const d = inv.features.find(x => x.id === dep);
      if (d && d.status === 'chopped') broken.push({ feature: f, missing: d });
    }
  }

  let out = `# Feature Inventory\n\n`;
  out += `- **Scanned**: ${inv.scannedAt || 'never'}\n`;
  out += `- **Depth**: ${inv.scanDepth}\n`;
  out += `- **Target**: ${inv.targetPath}\n`;
  out += `- **Features**: ${inv.features.length} (keep: ${kept.length}, chopped: ${chopped.length}, added: ${added.length})\n`;
  out += `- **Unmapped**: ${inv.unmapped.length}\n`;
  out += `- **Locked**: ${inv.locked}\n\n`;

  if (broken.length) {
    out += `## Dependency Warnings\n\n⚠️ **${broken.length} kept features depend on chopped features:**\n\n`;
    for (const b of broken) {
      out += `- **${b.feature.id}** "${b.feature.title}" → depends on **${b.missing.id}** "${b.missing.title}" (chopped)\n`;
    }
    out += '\n';
  }

  const groups = [
    { label: 'Kept', items: kept },
    { label: 'Chopped', items: chopped },
    { label: 'Added', items: added }
  ];

  for (const g of groups) {
    if (!g.items.length) continue;
    out += `## ${g.label} (${g.items.length})\n\n`;
    for (const f of g.items) {
      const tag = f.origin === 'added' ? 'added' : 'discovered';
      out += `### ${f.id} — ${f.title} [${f.size}, ${f.category}, ${f.status}, ${tag}]\n`;
      out += `${f.description}\n`;
      if (f.evidence?.length) out += `- Evidence: ${f.evidence.map(e => `\`${e}\``).join(', ')}\n`;
      if (f.dependencies?.length) out += `- Dependencies: ${f.dependencies.join(', ')}\n`;
      if (f.rationale) out += `- Rationale: ${f.rationale}\n`;
      if (f.status === 'chopped' && f.choppedAt) out += `- **Chopped**: ${f.choppedAt}\n`;
      if (f.addedAt) out += `- Added: ${f.addedAt}\n`;
      out += '\n';
    }
  }

  if (inv.unmapped.length) {
    out += `## Unmapped Areas\n\n`;
    for (const u of inv.unmapped) {
      out += `- \`${u.path}\` — ${u.reason}\n`;
    }
    out += '\n';
  }

  if (inv.history.length) {
    out += `## History (last 10)\n\n`;
    for (const h of inv.history.slice(-10).reverse()) {
      out += `- ${h.timestamp} — ${h.action}${h.ids ? `: ${h.ids.join(', ')}` : ''}${h.details ? ` — ${h.details}` : ''}\n`;
    }
  }
  return out;
}

function renderJson(inv) {
  return JSON.stringify(inv, null, 2);
}

async function cmdInit() {
  ensureDir();
  const inv = loadInventory();
  if (inv.features.length === 0 && !inv.scannedAt) {
    inv.scannedAt = now();
    inv.configSnapshot = { scan_depth: 'exhaustive', stack: '', constraints: [], tdd: true, spec_batch_size: 0 };
    saveInventory(inv);
    console.log(`Initialized ${INVENTORY_PATH}`);
  } else {
    console.log(`Inventory exists at ${INVENTORY_PATH} (${inv.features.length} features)`);
  }
}

async function cmdList(args) {
  const inv = loadInventory();
  const out = args.json ? renderJson(inv) : renderHuman(inv);
  console.log(out);
}

async function cmdAdd(args) {
  const inv = loadInventory();
  if (inv.locked && !args.force) { console.error('Inventory is locked'); process.exit(3); }

  const required = ['title', 'desc', 'rationale', 'category'];
  for (const r of required) if (!args[r]) { console.error(`Missing required: --${r}`); process.exit(2); }

  const cats = ['api','core','cli','auth','config','integration','observability','data','dead','unmapped'];
  if (!cats.includes(args.category)) { console.error(`Invalid category: ${args.category}`); process.exit(2); }

  const size = (args.size || 'M').toUpperCase();
  if (!['XS','S','M','L','XL'].includes(size)) { console.error(`Invalid size: ${size}`); process.exit(2); }

  const deps = (args.deps || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const d of deps) if (!inv.features.some(f => f.id === d)) { console.error(`Dependency not found: ${d}`); process.exit(4); }

  // Near-duplicate check
  const q = args.title.toLowerCase();
  const dupes = inv.features.filter(f =>
    f.title.toLowerCase().includes(q) || q.includes(f.title.toLowerCase())
  );
  if (dupes.length && !args.force) {
    console.error(`Potential duplicates: ${dupes.map(f => `${f.id} "${f.title}"`).join(', ')}`);
    console.error('Use --force to add anyway');
    process.exit(2);
  }

  const id = nextAId(inv);
  const feature = {
    id, title: args.title, description: args.desc, evidence: [],
    category: args.category, size, dependencies: deps, status: 'keep',
    origin: 'added', rationale: args.rationale, addedAt: now()
  };
  inv.features.push(feature);
  inv.history.push({ timestamp: now(), action: 'add', id, title: args.title, category: args.category, dependencies: deps, rationale: args.rationale });
  saveInventory(inv);
  console.log(`Added ${id}: ${args.title}`);
}

async function cmdChop(args) {
  const inv = loadInventory();
  if (inv.locked && !args.force) { console.error('Inventory is locked'); process.exit(3); }

  if (!args.reason) { console.error('Missing required: --reason'); process.exit(2); }

  const ids = [];
  for (const arg of args._) {
    if (arg.includes('-')) {
      const expanded = expandRange(inv, arg);
      if (!expanded) { console.error(`Invalid range: ${arg}`); process.exit(2); }
      ids.push(...expanded);
    } else if (inv.features.some(f => f.id === arg)) {
      ids.push(arg);
    } else {
      const matches = fuzzyMatch(inv, arg);
      if (matches.length === 1) ids.push(matches[0].id);
      else if (matches.length > 1) {
        console.error(`Fuzzy match "${arg}" matches: ${matches.map(f => `${f.id} "${f.title}"`).join(', ')}`);
        if (!args.force) { process.exit(2); }
        ids.push(...matches.map(f => f.id));
      } else {
        console.error(`No feature matched: ${arg}`); process.exit(4);
      }
    }
  }

  const uniqueIds = [...new Set(ids)];
  const targets = uniqueIds.map(id => findFeature(inv, id)).filter(Boolean);

  // Dependency check
  const broken = [];
  for (const { feature } of targets) {
    for (const f of inv.features) {
      if (f.status === 'keep' && (f.dependencies || []).includes(feature.id)) {
        broken.push({ featureId: f.id, featureTitle: f.title, missingDepId: feature.id, missingDepTitle: feature.title });
      }
    }
  }

  if (broken.length && !args.force && !args.dryRun) {
    console.error('Broken dependencies:');
    for (const b of broken) console.error(`  ${b.featureId} "${b.featureTitle}" → ${b.missingDepId} "${b.missingDepTitle}"`);
    console.error('Use --force to chop anyway');
    process.exit(2);
  }

  if (args.dryRun) {
    console.log('Would chop:', uniqueIds.join(', '));
    if (broken.length) console.log('Broken deps:', broken.map(b => `${b.featureId}→${b.missingDepId}`).join(', '));
    return;
  }

  for (const { feature, index } of targets) {
    if (feature.status === 'chopped') { console.log(`${feature.id} already chopped`); continue; }
    feature.status = 'chopped';
    feature.choppedAt = now();
    feature.chopReason = args.reason;
    inv.features[index] = feature;
  }

  inv.history.push({ timestamp: now(), action: 'chop', ids: uniqueIds, reason: args.reason, brokenDependencies: broken.map(b => b.featureId) });
  saveInventory(inv);
  console.log(`Chopped: ${uniqueIds.join(', ')}`);
  if (broken.length) console.log(`Warning: ${broken.length} broken dependencies introduced`);
}

async function cmdLock(args) {
  const inv = loadInventory();
  if (inv.locked) { console.log('Already locked'); return; }
  if (!args.force) {
    // In a real CLI we'd prompt; for script we require --force in automated mode
    console.error('Inventory not locked. Use --force to lock without prompt (automated mode).');
    process.exit(3);
  }
  inv.locked = true;
  inv.lockedAt = now();
  inv.history.push({ timestamp: now(), action: 'lock' });
  saveInventory(inv);
  console.log('Inventory locked');
}

async function cmdSetSpec(args) {
  const inv = loadInventory();
  const id = args.id || args._.shift();
  if (!id || !args.path || !args.branch || !args.status) {
    console.error('Usage: set-spec <id> --path <p> --branch <b> --status <success|skipped|failed> [--error "..."]');
    process.exit(1);
  }
  const { feature, index } = findFeature(inv, id) || {};
  if (!feature) { console.error(`Feature not found: ${id}`); process.exit(4); }

  if (!inv.specResults) inv.specResults = [];
  inv.specResults.push({
    featureId: id,
    specPath: args.path,
    branch: args.branch,
    status: args.status,
    error: args.error || null,
    timestamp: now()
  });
  saveInventory(inv);
  console.log(`Recorded spec result for ${id}: ${args.status}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._.shift() || 'help';

  try {
    switch (cmd) {
      case 'init': await cmdInit(); break;
      case 'list': await cmdList(args); break;
      case 'add': await cmdAdd(args); break;
      case 'chop': await cmdChop(args); break;
      case 'lock': await cmdLock(args); break;
      case 'set-spec': await cmdSetSpec(args); break;
      default:
        console.error(`Usage: tupec.mjs <init|list|add|chop|lock|set-spec> [args]`);
        process.exit(1);
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

main();