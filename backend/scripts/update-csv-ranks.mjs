import fs from 'fs';
import path from 'path';

/**
 * Direct CSV rank updater using Nielsen DMA rankings
 */

const CSV_PATH = path.resolve('c:/Users/joeba/Documents/inside_edition_call_list/data/ie data as of 12-6.csv');

// Nielsen DMA Rankings 2024-25 (cleaned from USTVDB snapshot)
const nielsenRankings = {
  'NEW YORK': 1,
  'LOS ANGELES': 2,
  'CHICAGO': 3,
  'DALLAS': 4,
  'PHILADELPHIA': 5,
  'HOUSTON': 6,
  'ATLANTA': 7,
  'WASHINGTON': 8,
  'BOSTON': 9,
  'SAN FRANCISCO': 10,
  'TAMPA': 11,
  'PHOENIX': 12,
  'SEATTLE': 13,
  'DETROIT': 14,
  'ORLANDO': 15,
  'MINNEAPOLIS': 16,
  'DENVER': 17,
  'MIAMI': 18,
  'CLEVELAND': 19,
  'SACRAMENTO': 20,
  'CHARLOTTE': 21,
  'RALEIGH': 22,
  'PORTLAND, OR': 23,
  'PORTLAND': 23, // alias
  'SAINT LOUIS': 24,
  'ST. LOUIS': 24, // alias
  'INDIANAPOLIS': 25,
  'NASHVILLE': 26,
  'PITTSBURGH': 27,
  'SALT LAKE CITY': 28,
  'BALTIMORE': 29,
  'SAN DIEGO': 30,
  'SAN ANTONIO': 31,
  'HARTFORD': 32,
  'KANSAS CITY': 33,
  'AUSTIN': 34,
  'COLUMBUS, OH': 35,
  'COLUMBUS': 35, // alias
  'GREENVILLE': 36,
  'CINCINNATI': 37,
  'MILWAUKEE': 38,
  'WEST PALM BEACH': 39,
  'LAS VEGAS': 40,
  'JACKSONVILLE': 41,
  'HARRISBURG': 42,
  'GRAND RAPIDS': 43,
  'NORFOLK': 44,
  'BIRMINGHAM': 45,
  'GREENSBORO': 46,
  'OKLAHOMA CITY': 47,
  'ALBUQUERQUE': 48,
  'LOUISVILLE': 49,
  'NEW ORLEANS': 50,
  'MEMPHIS': 51,
  'PROVIDENCE': 52,
  'FORT MYERS': 53,
  'FT. MYERS': 53, // alias
  'BUFFALO': 54,
  'FRESNO': 55,
  'RICHMOND': 56,
  'MOBILE': 57,
  'LITTLE ROCK': 58,
  'WILKES BARRE': 59,
  'KNOXVILLE': 60,
  'TULSA': 61,
  'ALBANY': 62,
  'LEXINGTON': 63,
  'DAYTON': 64,
  'TUCSON': 65,
  'SPOKANE': 66,
  'DES MOINES': 67,
  'GREEN BAY': 68,
  'HONOLULU': 69,
  'ROANOKE': 70,
  'WICHITA': 71,
  'FLINT': 72,
  'OMAHA': 73,
  'SPRINGFIELD, MO': 74,
  'HUNTSVILLE': 75,
  'COLUMBIA, SC': 76,
  'MADISON': 77,
  'PORTLAND-AUBURN': 78,
  'ROCHESTER, NY': 79,
  'ROCHESTER': 79, // Could be NY or MN - context needed
  'HARLINGEN': 80,
  'TOLEDO': 81,
  'CHARLESTON-HUNTINGTON': 82,
  'WACO': 83,
  'SAVANNAH': 84,
  'CHARLESTON, SC': 85,
  'CHATTANOOGA': 86,
  'COLORADO SPRINGS': 87,
  'SYRACUSE': 88,
  'EL PASO': 89,
  'PADUCAH': 90,
  'SHREVEPORT': 91,
  'CHAMPAIGN': 92,
  'BURLINGTON': 93,
  'CEDAR RAPIDS': 94,
  'BATON ROUGE': 95,
  'FORT SMITH': 96,
  'FT. SMITH': 96, // alias
  'MYRTLE BEACH': 97,
  'BOISE': 98,
  'JACKSON, MS': 99,
  'SOUTH BEND': 100,
  'TRI-CITIES': 101,
  'GREENVILLE-NEW BERN': 102,
  'RENO': 103,
  'DAVENPORT': 104,
  'TALLAHASSEE': 105,
  'TYLER': 106,
  'LINCOLN': 107,
  'AUGUSTA': 108,
  'EVANSVILLE': 109,
  'FORT WAYNE': 110,
  'SIOUX FALLS': 111,
  'JOHNSTOWN': 112,
  'FARGO': 113,
  'YAKIMA': 114,
  'SPRINGFIELD, MA': 115,
  'SPRINGFIELD': 115, // Could be MA or MO - context needed
  'TRAVERSE CITY': 116,
  'LANSING': 117,
  'YOUNGSTOWN': 118,
  'MACON': 119,
  'EUGENE': 120,
  'MONTGOMERY': 121,
  'PEORIA': 122,
  'SANTA BARBARA': 123,
  'LAFAYETTE, LA': 124,
  'BAKERSFIELD': 125,
  'WILMINGTON': 126,
  'COLUMBUS-OPELIKA': 127,
  'MONTEREY': 128,
  'LA CROSSE': 129,
  'CORPUS CHRISTI': 130,
  'SALISBURY': 131,
  'AMARILLO': 132,
  'WAUSAU': 133,
  'COLUMBUS-TUPELO': 134,
  'COLUMBIA-JEFFERSON CITY': 135,
  'CHICO': 136,
  'ROCKFORD': 137,
  'DULUTH': 138,
  'MEDFORD': 139,
  'LUBBOCK': 140,
  'TOPEKA': 141,
  'MONROE': 142,
  'BEAUMONT': 143,
  'ODESSA': 144,
  'ODESSA MIDLAND': 144, // alias
  'PALM SPRINGS': 145,
  'ANCHORAGE': 146,
  'BISMARCK': 147,
  'PANAMA CITY': 148,
  'SIOUX CITY': 149,
  'WICHITA FALLS': 150,
  'JOPLIN': 151,
  'ALBANY, GA': 152,
  'ROCHESTER-MASON CITY': 153,
  'ERIE': 154,
  'IDAHO FALLS': 155,
  'BANGOR': 156,
  'GAINESVILLE': 157,
  'BILOXI': 158,
  'TERRE HAUTE': 159,
  'SHERMAN': 160,
  'MISSOULA': 161,
  'BINGHAMTON': 162,
  'WHEELING': 163,
  'YUMA': 164,
  'BILLINGS': 165,
  'ABILENE': 166,
  'BLUEFIELD': 167,
  'HATTIESBURG': 168,
  'LAUREL-HATTIESBURG': 168, // alias
  'RAPID CITY': 169,
  'DOTHAN': 170,
  'UTICA': 171,
  'CLARKSBURG': 172,
  'HARRISONBURG': 173,
  'JACKSON, TN': 174,
  'QUINCY': 175,
  'CHARLOTTESVILLE': 176,
  'LAKE CHARLES': 177,
  'ELMIRA': 178,
  'WATERTOWN': 179,
  'BOWLING GREEN': 180,
  'MARQUETTE': 181,
  'JONESBORO': 182,
  'ALEXANDRIA': 183,
  'LAREDO': 184,
  'BUTTE': 185,
  'BEND': 186,
  'LIMA': 187,
  'LAFAYETTE, IN': 188,
  'EUREKA': 189,
  'TWIN FALLS': 190,
  'COLUMBIA': 191, // Could be SC, MO, or other
  'CASPER': 192,
  'PARKERSBURG': 193,
  'MANKATO': 194,
  'CHEYENNE': 195,
  'SAN ANGELO': 196,
  'LA CROSSE-EAU CLAIRE': 197,
  'MINOT': 198,
  'PRESQUE ISLE': 199,
  'GRAND JUNCTION': 200
};

function cleanCityName(city) {
  if (!city) return '';
  // Remove quotes and extra whitespace
  let cleaned = city.replace(/^"|"$/g, '').trim();
  // Extract city from "CITY, STATE" format
  const match = cleaned.match(/^([^,]+)/);
  if (match) {
    cleaned = match[1].trim().toUpperCase();
  }
  return cleaned;
}

function findNielsenRank(cityField) {
  const city = cleanCityName(cityField);
  
  // Direct lookup
  if (nielsenRankings[city]) {
    return nielsenRankings[city];
  }
  
  // Try to find partial matches for compound city names
  for (const [key, rank] of Object.entries(nielsenRankings)) {
    if (city.includes(key) || key.includes(city)) {
      return rank;
    }
  }
  
  // Special cases
  if (city.includes('PENSACOLA') || city.includes('MOBILE')) return 57;
  if (city.includes('BRYAN') && city.includes('TX')) return 83; // Part of Waco-Temple-Bryan
  if (city.includes('WASHINGTON') && city.includes('D.C')) return 8;
  
  return null;
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

function updateCsvRanks() {
  console.log('Starting CSV rank update...');
  console.log('CSV Path:', CSV_PATH);
  console.log('File exists:', fs.existsSync(CSV_PATH));
  
  const csvText = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = csvText.replace(/\r\n/g, '\n').split('\n');
  console.log('Total lines:', lines.length);
  
  if (lines.length === 0) {
    console.log('Empty CSV file');
    return;
  }

  const headerLine = lines[0];
  const headerValues = parseCsvLine(headerLine).map((h) => h.trim());
  const rankIndex = headerValues.indexOf('Rank');
  const cityIndex = headerValues.indexOf('City');

  if (rankIndex === -1 || cityIndex === -1) {
    console.log('CSV header does not contain expected Rank/City columns');
    return;
  }

  console.log(`Found headers: Rank at index ${rankIndex}, City at index ${cityIndex}`);

  const updatedLines = [headerLine];
  let updatedCount = 0;
  let unmatched = 0;
  const changes = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      updatedLines.push(line);
      continue;
    }
    
    const values = parseCsvLine(line);
    const cityField = values[cityIndex] || '';
    const oldRank = values[rankIndex];
    
    const newRank = findNielsenRank(cityField);
    
    if (!newRank) {
      unmatched++;
      updatedLines.push(line);
      console.log(`  No match found for: ${cityField}`);
      continue;
    }

    if (oldRank !== String(newRank)) {
      values[rankIndex] = String(newRank);
      updatedCount++;
      changes.push({ line: i + 1, city: cleanCityName(cityField), oldRank, newRank });
      console.log(`  Line ${i + 1}: ${cleanCityName(cityField)} - ${oldRank} → ${newRank}`);
    }
    
    updatedLines.push(toCsvLine(values));
  }

  fs.writeFileSync(CSV_PATH, updatedLines.join('\n'), 'utf8');
  
  console.log(`\n✓ Updated ${updatedCount} ranks`);
  console.log(`✓ ${unmatched} rows had no match and were left unchanged`);
  console.log(`✓ Wrote updated CSV to: ${CSV_PATH}`);
  
  if (changes.length > 0) {
    console.log('\nChanges made:');
    changes.forEach(({ line, city, oldRank, newRank }) => {
      console.log(`  Line ${line}: ${city} - ${oldRank} → ${newRank}`);
    });
  }
}

updateCsvRanks();
