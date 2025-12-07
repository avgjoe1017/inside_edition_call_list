import fs from 'fs';
import path from 'path';

/**
 * Update market ranks from the USTVDB 2024-25 Nielsen DMA rankings page.
 *
 * Steps:
 * 1. Parse DMA ranks from a Cursor browser snapshot of
 *    https://ustvdb.com/seasons/2024-25/markets/
 * 2. Update `backend/prisma/seed.ts` so each DMA's `rank` matches USTVDB.
 * 3. Update `data/ie data as of 12-6.csv` Rank column to match the seeded ranks.
 *
 * NOTE: This script is intended as a one-off maintenance tool.
 */

const ROOT = path.resolve(path.join(import.meta.url.replace('file://', ''), '..', '..'));

// Default snapshot path from Cursor (can be overridden via env)
const SNAPSHOT_PATH = process.env.USTVDB_SNAPSHOT_PATH ||
  path.resolve(process.env.USERPROFILE || process.env.HOME || 'C:/Users/joeba',
    '.cursor/browser-logs/snapshot-2025-12-07T09-00-15-217Z.log');

const SEED_PATH = path.join(ROOT, 'prisma', 'seed.ts');
const CSV_PATH = path.join(ROOT, '..', 'data', 'ie data as of 12-6.csv');

function log(msg) {
  console.log(`[update-market-ranks] ${msg}`);
}

/** Parse DMA rows from the USTVDB snapshot */
function loadUstvdbDmas(snapshotPath) {
  const text = fs.readFileSync(snapshotPath, 'utf8');
  const regex = /name:\s+(\d+)\s+(.+?)\s+[\d,]+\s+([\d.]+)%/g;
  const dmas = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    const rank = parseInt(m[1], 10);
    const name = m[2].trim();
    if (!Number.isNaN(rank)) {
      dmas.push({ rank, name, rawLine: m[0] });
    }
  }
  dmas.sort((a, b) => a.rank - b.rank);
  log(`Loaded ${dmas.length} DMA rows from snapshot`);
  return dmas;
}

function tokenize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3);
}

function tokensSimilar(a, b) {
  if (a === b) return true;
  const min = Math.min(a.length, b.length);
  if (min < 3) return false;
  return a.slice(0, min) === b.slice(0, min);
}

function bestMatchForSeed(seedName, seedState, dmas) {
  const seedTokens = tokenize(seedName);
  let best = null;

  for (const dma of dmas) {
    const dmaTokens = tokenize(dma.name);
    let tokenScore = 0;
    for (const st of seedTokens) {
      for (const dt of dmaTokens) {
        if (tokensSimilar(st, dt)) {
          tokenScore++;
          break;
        }
      }
    }
    if (tokenScore === 0) continue;

    let score = tokenScore * 10;
    const state = (seedState || '').toUpperCase();
    if (state && dma.name.includes(`, ${state}`)) {
      score += 2;
    }

    if (!best || score > best.score) {
      best = { dma, score };
    }
  }

  return best ? best.dma.rank : null;
}

function parseSeedAndUpdateRanks(seedSource, dmas) {
  const entryRegex = /\{\s*rank:\s*(\d+),\s*name:\s*'([^']+)',\s*state:\s*'([^']+)',\s*areaCode:\s*'([^']+)'\s*\},/g;
  let unmatched = 0;
  let updatedCount = 0;

  const updatedSource = seedSource.replace(entryRegex, (full, oldRank, name, state, areaCode) => {
    const newRank = bestMatchForSeed(name, state, dmas);
    if (newRank == null) {
      unmatched++;
      return full; // leave as-is
    }
    if (parseInt(oldRank, 10) !== newRank) {
      updatedCount++;
    }
    return `{ rank: ${newRank}, name: '${name}', state: '${state}', areaCode: '${areaCode}' },`;
  });

  log(`Updated ${updatedCount} seed DMA ranks; ${unmatched} entries had no match and kept their old rank`);
  return updatedSource;
}

function extractSeedMarkets(seedSource) {
  const entryRegex = /\{\s*rank:\s*(\d+),\s*name:\s*'([^']+)',\s*state:\s*'([^']+)',\s*areaCode:\s*'([^']+)'\s*\},/g;
  const markets = [];
  let m;
  while ((m = entryRegex.exec(seedSource)) !== null) {
    markets.push({
      rank: parseInt(m[1], 10),
      name: m[2],
      state: m[3],
      areaCode: m[4],
    });
  }
  return markets;
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function toCsvLine(values) {
  return values
    .map((v) => {
      const needsQuote = /[",\n]/.test(v);
      let out = v.replace(/"/g, '""');
      return needsQuote ? `"${out}"` : out;
    })
    .join(',');
}

function parseCityAndState(cityField) {
  if (!cityField) return { city: cityField, state: null };
  const m = cityField.match(/^(.*?),\s*([A-Za-z]{2})\b/);
  if (!m) {
    return { city: cityField.trim(), state: null };
  }
  return { city: m[1].trim(), state: m[2].toUpperCase() };
}

function bestSeedForCsv(cityName, stateCode, seedMarkets) {
  const cityTokens = tokenize(cityName);
  let best = null;

  for (const mkt of seedMarkets) {
    const nameTokens = tokenize(mkt.name);
    let tokenScore = 0;
    for (const ct of cityTokens) {
      for (const nt of nameTokens) {
        if (tokensSimilar(ct, nt)) {
          tokenScore++;
          break;
        }
      }
    }
    if (tokenScore === 0) continue;

    let score = tokenScore * 10;
    if (stateCode && mkt.state.toUpperCase() === stateCode.toUpperCase()) {
      score += 2;
    }

    if (!best || score > best.score) {
      best = { market: mkt, score };
    }
  }

  return best ? best.market : null;
}

function updateCsvRanks(csvText, seedMarkets) {
  const lines = csvText.replace(/\r\n/g, '\n').split('\n');
  if (lines.length === 0) return csvText;

  const headerLine = lines[0];
  const headerValues = parseCsvLine(headerLine).map((h) => h.trim());
  const rankIndex = headerValues.indexOf('Rank');
  const cityIndex = headerValues.indexOf('City');

  if (rankIndex === -1 || cityIndex === -1) {
    log('CSV header does not contain expected Rank/City columns; skipping CSV update');
    return csvText;
  }

  const updatedLines = [headerLine];
  let updatedCount = 0;
  let unmatched = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      updatedLines.push(line);
      continue;
    }
    const values = parseCsvLine(line);
    const cityField = values[cityIndex] || '';
    const { city, state } = parseCityAndState(cityField.replace(/^"|"$/g, ''));

    const match = bestSeedForCsv(city, state, seedMarkets);
    if (!match) {
      unmatched++;
      updatedLines.push(line);
      continue;
    }

    const oldRank = values[rankIndex];
    const newRank = String(match.rank);
    if (oldRank !== newRank) {
      values[rankIndex] = newRank;
      updatedCount++;
    }
    updatedLines.push(toCsvLine(values));
  }

  log(`Updated ${updatedCount} CSV Rank cells; ${unmatched} rows had no DMA match and were left unchanged`);
  return updatedLines.join('\n');
}

async function main() {
  log(`Using snapshot: ${SNAPSHOT_PATH}`);
  const dmas = loadUstvdbDmas(SNAPSHOT_PATH);
  if (!dmas.length) {
    throw new Error('No DMA rows found in snapshot; aborting');
  }

  // Update seed.ts ranks
  const seedSource = fs.readFileSync(SEED_PATH, 'utf8');
  const updatedSeedSource = parseSeedAndUpdateRanks(seedSource, dmas);
  fs.writeFileSync(SEED_PATH, updatedSeedSource, 'utf8');
  log(`Wrote updated seed file: ${SEED_PATH}`);

  // Extract updated markets for CSV mapping
  const seedMarkets = extractSeedMarkets(updatedSeedSource);
  log(`Extracted ${seedMarkets.length} markets from updated seed`);

  // Update CSV ranks
  if (fs.existsSync(CSV_PATH)) {
    const csvText = fs.readFileSync(CSV_PATH, 'utf8');
    const updatedCsv = updateCsvRanks(csvText, seedMarkets);
    fs.writeFileSync(CSV_PATH, updatedCsv, 'utf8');
    log(`Wrote updated CSV file: ${CSV_PATH}`);
  } else {
    log(`CSV file not found at ${CSV_PATH}; skipping CSV update`);
  }

  log('Done updating market ranks from USTVDB');
}

main().catch((err) => {
  console.error('[update-market-ranks] ERROR:', err);
  process.exit(1);
});
