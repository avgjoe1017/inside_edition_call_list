import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Helper to generate a phone number based on market
function generatePhone(areaCode: string, suffix: number): string {
  return `+1 (${areaCode}) ${String(suffix).padStart(3, '0')}-${String(1000 + (suffix % 9000)).padStart(4, '0')}`;
}

// Get timezone based on state
function getTimezone(state: string): string {
  const eastern = ['NY', 'NJ', 'PA', 'MA', 'CT', 'RI', 'VT', 'NH', 'ME', 'MD', 'DE', 'VA', 'WV', 'NC', 'SC', 'GA', 'FL', 'OH', 'MI', 'IN', 'KY', 'TN', 'DC'];
  const central = ['IL', 'WI', 'MN', 'IA', 'MO', 'AR', 'LA', 'MS', 'AL', 'TX', 'OK', 'KS', 'NE', 'SD', 'ND'];
  const mountain = ['MT', 'WY', 'CO', 'NM', 'AZ', 'UT', 'ID', 'NV'];
  const pacific = ['WA', 'OR', 'CA'];
  const alaska = ['AK'];
  const hawaii = ['HI'];

  if (eastern.some(s => state.includes(s))) return 'EST';
  if (central.some(s => state.includes(s))) return 'CST';
  if (mountain.some(s => state.includes(s))) return 'MST';
  if (pacific.some(s => state.includes(s))) return 'PST';
  if (alaska.some(s => state.includes(s))) return 'AKST';
  if (hawaii.some(s => state.includes(s))) return 'HST';
  return 'EST';
}

// Generate EST air time and local timezone
// All shows air at 10:00 PM EST, but we store what time that is locally
function getAirTimeAndTimezone(timezone: string): { estTime: string; localTz: string | null } {
  // All shows air at 10:00 PM EST
  const estTime = '10:00 PM';

  // If the local timezone is EST, no need to show local time
  if (timezone === 'EST') {
    return { estTime, localTz: null };
  }

  // Otherwise, return the local timezone for display
  return { estTime, localTz: timezone };
}

async function main() {
  console.log('Seeding database with all 210 DMA TV markets...');

  // Clear existing data
  await prisma.phoneNumber.deleteMany();
  await prisma.market.deleteMany();

  // Complete list of all 210 Nielsen DMA markets for 2024-25 season
  const allMarkets: Array<{ rank: number; name: string; state: string; areaCode: string }> = [
    { rank: 1, name: 'New York', state: 'NY', areaCode: '212' },
    { rank: 2, name: 'Los Angeles', state: 'CA', areaCode: '323' },
    { rank: 3, name: 'Chicago', state: 'IL', areaCode: '312' },
    { rank: 4, name: 'Philadelphia', state: 'PA', areaCode: '215' },
    { rank: 5, name: 'Dallas-Fort Worth', state: 'TX', areaCode: '214' },
    { rank: 6, name: 'San Francisco-Oakland-San Jose', state: 'CA', areaCode: '415' },
    { rank: 7, name: 'Atlanta', state: 'GA', areaCode: '404' },
    { rank: 8, name: 'Houston', state: 'TX', areaCode: '713' },
    { rank: 9, name: 'Washington, DC', state: 'DC', areaCode: '202' },
    { rank: 10, name: 'Boston', state: 'MA', areaCode: '617' },
    { rank: 11, name: 'Phoenix', state: 'AZ', areaCode: '602' },
    { rank: 12, name: 'Seattle-Tacoma', state: 'WA', areaCode: '206' },
    { rank: 13, name: 'Tampa-St. Petersburg', state: 'FL', areaCode: '813' },
    { rank: 14, name: 'Minneapolis-St. Paul', state: 'MN', areaCode: '612' },
    { rank: 15, name: 'Denver', state: 'CO', areaCode: '303' },
    { rank: 16, name: 'Orlando-Daytona Beach', state: 'FL', areaCode: '407' },
    { rank: 17, name: 'Miami-Fort Lauderdale', state: 'FL', areaCode: '305' },
    { rank: 18, name: 'Cleveland-Akron', state: 'OH', areaCode: '216' },
    { rank: 19, name: 'Sacramento-Stockton', state: 'CA', areaCode: '916' },
    { rank: 20, name: 'Charlotte', state: 'NC', areaCode: '704' },
    { rank: 21, name: 'Portland, OR', state: 'OR', areaCode: '503' },
    { rank: 22, name: 'St. Louis', state: 'MO', areaCode: '314' },
    { rank: 23, name: 'Pittsburgh', state: 'PA', areaCode: '412' },
    { rank: 24, name: 'Raleigh-Durham', state: 'NC', areaCode: '919' },
    { rank: 25, name: 'Baltimore', state: 'MD', areaCode: '410' },
    { rank: 26, name: 'Nashville', state: 'TN', areaCode: '615' },
    { rank: 27, name: 'San Diego', state: 'CA', areaCode: '619' },
    { rank: 28, name: 'Indianapolis', state: 'IN', areaCode: '317' },
    { rank: 29, name: 'Salt Lake City', state: 'UT', areaCode: '801' },
    { rank: 30, name: 'San Antonio', state: 'TX', areaCode: '210' },
    { rank: 31, name: 'Hartford-New Haven', state: 'CT', areaCode: '860' },
    { rank: 32, name: 'Kansas City', state: 'MO', areaCode: '816' },
    { rank: 33, name: 'Columbus, OH', state: 'OH', areaCode: '614' },
    { rank: 34, name: 'Austin', state: 'TX', areaCode: '512' },
    { rank: 35, name: 'Milwaukee', state: 'WI', areaCode: '414' },
    { rank: 36, name: 'Cincinnati', state: 'OH', areaCode: '513' },
    { rank: 37, name: 'Las Vegas', state: 'NV', areaCode: '702' },
    { rank: 38, name: 'Jacksonville', state: 'FL', areaCode: '904' },
    { rank: 39, name: 'Oklahoma City', state: 'OK', areaCode: '405' },
    { rank: 40, name: 'Greenville-Spartanburg', state: 'SC', areaCode: '864' },
    { rank: 41, name: 'Grand Rapids-Kalamazoo', state: 'MI', areaCode: '616' },
    { rank: 42, name: 'West Palm Beach-Fort Pierce', state: 'FL', areaCode: '561' },
    { rank: 43, name: 'Birmingham', state: 'AL', areaCode: '205' },
    { rank: 44, name: 'Harrisburg-Lancaster', state: 'PA', areaCode: '717' },
    { rank: 45, name: 'Norfolk-Portsmouth', state: 'VA', areaCode: '757' },
    { rank: 46, name: 'Greensboro-High Point', state: 'NC', areaCode: '336' },
    { rank: 47, name: 'Albuquerque-Santa Fe', state: 'NM', areaCode: '505' },
    { rank: 48, name: 'Louisville', state: 'KY', areaCode: '502' },
    { rank: 49, name: 'Memphis', state: 'TN', areaCode: '901' },
    { rank: 50, name: 'Albany-Schenectady', state: 'NY', areaCode: '518' },
    { rank: 51, name: 'Fresno-Visalia', state: 'CA', areaCode: '559' },
    { rank: 52, name: 'New Orleans', state: 'LA', areaCode: '504' },
    { rank: 53, name: 'Providence-New Bedford', state: 'RI', areaCode: '401' },
    { rank: 54, name: 'Buffalo', state: 'NY', areaCode: '716' },
    { rank: 55, name: 'Tucson', state: 'AZ', areaCode: '520' },
    { rank: 56, name: 'Little Rock-Pine Bluff', state: 'AR', areaCode: '501' },
    { rank: 57, name: 'Richmond-Petersburg', state: 'VA', areaCode: '804' },
    { rank: 58, name: 'Tulsa', state: 'OK', areaCode: '918' },
    { rank: 59, name: 'Knoxville', state: 'TN', areaCode: '865' },
    { rank: 60, name: 'Dayton', state: 'OH', areaCode: '937' },
    { rank: 61, name: 'Lexington', state: 'KY', areaCode: '859' },
    { rank: 62, name: 'Wilkes Barre-Scranton', state: 'PA', areaCode: '570' },
    { rank: 63, name: 'Charleston-Huntington', state: 'WV', areaCode: '304' },
    { rank: 64, name: 'Honolulu', state: 'HI', areaCode: '808' },
    { rank: 65, name: 'Wichita-Hutchinson', state: 'KS', areaCode: '316' },
    { rank: 66, name: 'Mobile-Pensacola', state: 'AL', areaCode: '251' },
    { rank: 67, name: 'Flint-Saginaw-Bay City', state: 'MI', areaCode: '810' },
    { rank: 68, name: 'Rochester, NY', state: 'NY', areaCode: '585' },
    { rank: 69, name: 'Des Moines-Ames', state: 'IA', areaCode: '515' },
    { rank: 70, name: 'Omaha', state: 'NE', areaCode: '402' },
    { rank: 71, name: 'Green Bay-Appleton', state: 'WI', areaCode: '920' },
    { rank: 72, name: 'Springfield, MO', state: 'MO', areaCode: '417' },
    { rank: 73, name: 'Portland-Auburn', state: 'ME', areaCode: '207' },
    { rank: 74, name: 'Toledo', state: 'OH', areaCode: '419' },
    { rank: 75, name: 'Syracuse', state: 'NY', areaCode: '315' },
    { rank: 76, name: 'Spokane', state: 'WA', areaCode: '509' },
    { rank: 77, name: 'Roanoke-Lynchburg', state: 'VA', areaCode: '540' },
    { rank: 78, name: 'Paducah-Cape Girardeau', state: 'KY', areaCode: '270' },
    { rank: 79, name: 'Columbia, SC', state: 'SC', areaCode: '803' },
    { rank: 80, name: 'Shreveport', state: 'LA', areaCode: '318' },
    { rank: 81, name: 'Champaign-Springfield-Decatur', state: 'IL', areaCode: '217' },
    { rank: 82, name: 'Huntsville-Decatur', state: 'AL', areaCode: '256' },
    { rank: 83, name: 'Madison', state: 'WI', areaCode: '608' },
    { rank: 84, name: 'Chattanooga', state: 'TN', areaCode: '423' },
    { rank: 85, name: 'Fort Myers-Naples', state: 'FL', areaCode: '239' },
    { rank: 86, name: 'Harlingen-Weslaco-McAllen', state: 'TX', areaCode: '956' },
    { rank: 87, name: 'South Bend-Elkhart', state: 'IN', areaCode: '574' },
    { rank: 88, name: 'Colorado Springs-Pueblo', state: 'CO', areaCode: '719' },
    { rank: 89, name: 'Cedar Rapids-Waterloo', state: 'IA', areaCode: '319' },
    { rank: 90, name: 'Jackson, MS', state: 'MS', areaCode: '601' },
    { rank: 91, name: 'El Paso', state: 'TX', areaCode: '915' },
    { rank: 92, name: 'Waco-Temple-Bryan', state: 'TX', areaCode: '254' },
    { rank: 93, name: 'Burlington-Plattsburgh', state: 'VT', areaCode: '802' },
    { rank: 94, name: 'Tri-Cities, TN-VA', state: 'TN', areaCode: '423' },
    { rank: 95, name: 'Baton Rouge', state: 'LA', areaCode: '225' },
    { rank: 96, name: 'Savannah', state: 'GA', areaCode: '912' },
    { rank: 97, name: 'Davenport-Rock Island-Moline', state: 'IA', areaCode: '563' },
    { rank: 98, name: 'Charleston, SC', state: 'SC', areaCode: '843' },
    { rank: 99, name: 'Evansville', state: 'IN', areaCode: '812' },
    { rank: 100, name: 'Johnstown-Altoona', state: 'PA', areaCode: '814' },
    { rank: 101, name: 'Youngstown', state: 'OH', areaCode: '330' },
    { rank: 102, name: 'Lincoln-Hastings-Kearney', state: 'NE', areaCode: '402' },
    { rank: 103, name: 'Myrtle Beach-Florence', state: 'SC', areaCode: '843' },
    { rank: 104, name: 'Greenville-New Bern', state: 'NC', areaCode: '252' },
    { rank: 105, name: 'Ft. Smith-Fayetteville', state: 'AR', areaCode: '479' },
    { rank: 106, name: 'Tyler-Longview', state: 'TX', areaCode: '903' },
    { rank: 107, name: 'Tallahassee-Thomasville', state: 'FL', areaCode: '850' },
    { rank: 108, name: 'Sioux Falls-Mitchell', state: 'SD', areaCode: '605' },
    { rank: 109, name: 'Lansing', state: 'MI', areaCode: '517' },
    { rank: 110, name: 'Traverse City-Cadillac', state: 'MI', areaCode: '231' },
    { rank: 111, name: 'Augusta', state: 'GA', areaCode: '706' },
    { rank: 112, name: 'Macon', state: 'GA', areaCode: '478' },
    { rank: 113, name: 'Montgomery-Selma', state: 'AL', areaCode: '334' },
    { rank: 114, name: 'Peoria-Bloomington', state: 'IL', areaCode: '309' },
    { rank: 115, name: 'Bakersfield', state: 'CA', areaCode: '661' },
    { rank: 116, name: 'Santa Barbara-Santa Maria', state: 'CA', areaCode: '805' },
    { rank: 117, name: 'Lafayette, LA', state: 'LA', areaCode: '337' },
    { rank: 118, name: 'Columbus, GA', state: 'GA', areaCode: '706' },
    { rank: 119, name: 'Monterey-Salinas', state: 'CA', areaCode: '831' },
    { rank: 120, name: 'Yakima-Pasco-Richland', state: 'WA', areaCode: '509' },
    { rank: 121, name: 'Corpus Christi', state: 'TX', areaCode: '361' },
    { rank: 122, name: 'La Crosse-Eau Claire', state: 'WI', areaCode: '608' },
    { rank: 123, name: 'Amarillo', state: 'TX', areaCode: '806' },
    { rank: 124, name: 'Wilmington', state: 'NC', areaCode: '910' },
    { rank: 125, name: 'Chico-Redding', state: 'CA', areaCode: '530' },
    { rank: 126, name: 'Reno', state: 'NV', areaCode: '775' },
    { rank: 127, name: 'Columbus-Tupelo-West Point', state: 'MS', areaCode: '662' },
    { rank: 128, name: 'Rockford', state: 'IL', areaCode: '815' },
    { rank: 129, name: 'Wausau-Rhinelander', state: 'WI', areaCode: '715' },
    { rank: 130, name: 'Duluth-Superior', state: 'MN', areaCode: '218' },
    { rank: 131, name: 'Monroe-El Dorado', state: 'LA', areaCode: '318' },
    { rank: 132, name: 'Topeka', state: 'KS', areaCode: '785' },
    { rank: 133, name: 'Medford-Klamath Falls', state: 'OR', areaCode: '541' },
    { rank: 134, name: 'Beaumont-Port Arthur', state: 'TX', areaCode: '409' },
    { rank: 135, name: 'Lubbock', state: 'TX', areaCode: '806' },
    { rank: 136, name: 'Columbia-Jefferson City', state: 'MO', areaCode: '573' },
    { rank: 137, name: 'Salisbury', state: 'MD', areaCode: '410' },
    { rank: 138, name: 'Palm Springs', state: 'CA', areaCode: '760' },
    { rank: 139, name: 'Anchorage', state: 'AK', areaCode: '907' },
    { rank: 140, name: 'Sioux City', state: 'IA', areaCode: '712' },
    { rank: 141, name: 'Erie', state: 'PA', areaCode: '814' },
    { rank: 142, name: 'Terre Haute', state: 'IN', areaCode: '812' },
    { rank: 143, name: 'Binghamton', state: 'NY', areaCode: '607' },
    { rank: 144, name: 'Wheeling-Steubenville', state: 'WV', areaCode: '304' },
    { rank: 145, name: 'Joplin-Pittsburg', state: 'MO', areaCode: '417' },
    { rank: 146, name: 'Bangor', state: 'ME', areaCode: '207' },
    { rank: 147, name: 'Rochester-Mason City-Austin', state: 'MN', areaCode: '507' },
    { rank: 148, name: 'Bluefield-Beckley-Oak Hill', state: 'WV', areaCode: '304' },
    { rank: 149, name: 'Odessa-Midland', state: 'TX', areaCode: '432' },
    { rank: 150, name: 'Minot-Bismarck-Dickinson', state: 'ND', areaCode: '701' },
    { rank: 151, name: 'Panama City', state: 'FL', areaCode: '850' },
    { rank: 152, name: 'Abilene-Sweetwater', state: 'TX', areaCode: '325' },
    { rank: 153, name: 'Gainesville', state: 'FL', areaCode: '352' },
    { rank: 154, name: 'Biloxi-Gulfport', state: 'MS', areaCode: '228' },
    { rank: 155, name: 'Sherman-Ada', state: 'TX', areaCode: '903' },
    { rank: 156, name: 'Idaho Falls-Pocatello', state: 'ID', areaCode: '208' },
    { rank: 157, name: 'Utica', state: 'NY', areaCode: '315' },
    { rank: 158, name: 'Clarksburg-Weston', state: 'WV', areaCode: '304' },
    { rank: 159, name: 'Hattiesburg-Laurel', state: 'MS', areaCode: '601' },
    { rank: 160, name: 'Quincy-Hannibal-Keokuk', state: 'IL', areaCode: '217' },
    { rank: 161, name: 'Billings', state: 'MT', areaCode: '406' },
    { rank: 162, name: 'Yuma-El Centro', state: 'AZ', areaCode: '928' },
    { rank: 163, name: 'Dothan', state: 'AL', areaCode: '334' },
    { rank: 164, name: 'Lake Charles', state: 'LA', areaCode: '337' },
    { rank: 165, name: 'Rapid City', state: 'SD', areaCode: '605' },
    { rank: 166, name: 'Jackson, TN', state: 'TN', areaCode: '731' },
    { rank: 167, name: 'Marquette', state: 'MI', areaCode: '906' },
    { rank: 168, name: 'Elmira', state: 'NY', areaCode: '607' },
    { rank: 169, name: 'Bowling Green', state: 'KY', areaCode: '270' },
    { rank: 170, name: 'Alexandria, LA', state: 'LA', areaCode: '318' },
    { rank: 171, name: 'Harrisonburg', state: 'VA', areaCode: '540' },
    { rank: 172, name: 'Charlottesville', state: 'VA', areaCode: '434' },
    { rank: 173, name: 'Great Falls', state: 'MT', areaCode: '406' },
    { rank: 174, name: 'Watertown', state: 'NY', areaCode: '315' },
    { rank: 175, name: 'Parkersburg', state: 'WV', areaCode: '304' },
    { rank: 176, name: 'Jonesboro', state: 'AR', areaCode: '870' },
    { rank: 177, name: 'Greenwood-Greenville', state: 'MS', areaCode: '662' },
    { rank: 178, name: 'Eureka', state: 'CA', areaCode: '707' },
    { rank: 179, name: 'Grand Junction-Montrose', state: 'CO', areaCode: '970' },
    { rank: 180, name: 'Bend, OR', state: 'OR', areaCode: '541' },
    { rank: 181, name: 'Mankato', state: 'MN', areaCode: '507' },
    { rank: 182, name: 'Meridian', state: 'MS', areaCode: '601' },
    { rank: 183, name: 'Missoula', state: 'MT', areaCode: '406' },
    { rank: 184, name: 'Abilene-Sweetwater', state: 'TX', areaCode: '325' },
    { rank: 185, name: 'Laredo', state: 'TX', areaCode: '956' },
    { rank: 186, name: 'Casper-Riverton', state: 'WY', areaCode: '307' },
    { rank: 187, name: 'Butte-Bozeman', state: 'MT', areaCode: '406' },
    { rank: 188, name: 'Lafayette, IN', state: 'IN', areaCode: '765' },
    { rank: 189, name: 'San Angelo', state: 'TX', areaCode: '325' },
    { rank: 190, name: 'Cheyenne-Scottsbluff', state: 'WY', areaCode: '307' },
    { rank: 191, name: 'Ottumwa-Kirksville', state: 'IA', areaCode: '641' },
    { rank: 192, name: 'St. Joseph', state: 'MO', areaCode: '816' },
    { rank: 193, name: 'Lima', state: 'OH', areaCode: '419' },
    { rank: 194, name: 'Fairbanks', state: 'AK', areaCode: '907' },
    { rank: 195, name: 'Twin Falls', state: 'ID', areaCode: '208' },
    { rank: 196, name: 'Victoria', state: 'TX', areaCode: '361' },
    { rank: 197, name: 'Zanesville', state: 'OH', areaCode: '740' },
    { rank: 198, name: 'Presque Isle', state: 'ME', areaCode: '207' },
    { rank: 199, name: 'Helena', state: 'MT', areaCode: '406' },
    { rank: 200, name: 'Juneau', state: 'AK', areaCode: '907' },
    { rank: 201, name: 'Alpena', state: 'MI', areaCode: '989' },
    { rank: 202, name: 'North Platte', state: 'NE', areaCode: '308' },
    { rank: 203, name: 'Glendive', state: 'MT', areaCode: '406' },
    { rank: 204, name: 'Tuscaloosa', state: 'AL', areaCode: '205' },
    { rank: 205, name: 'Steamboat Springs', state: 'CO', areaCode: '970' },
    { rank: 206, name: 'Flagstaff', state: 'AZ', areaCode: '928' },
    { rank: 207, name: 'Fargo-Valley City', state: 'ND', areaCode: '701' },
    { rank: 208, name: 'Bowling Green', state: 'KY', areaCode: '270' },
    { rank: 209, name: 'Harrisburg', state: 'IL', areaCode: '618' },
    { rank: 210, name: 'Sarasota-Bradenton', state: 'FL', areaCode: '941' },
  ];

  // Create markets with phones
  let count = 0;
  for (const m of allMarkets) {
    const timezone = getTimezone(m.state);
    const { estTime } = getAirTimeAndTimezone(timezone);

    // Assign markets to 3pm or 6pm list (first 100 markets get 3pm, rest get 6pm)
    const list = m.rank <= 100 ? '3pm' : '6pm';

    await prisma.market.create({
      data: {
        marketNumber: m.rank,
        name: m.name,
        airTime: estTime,
        timezone: timezone,
        list: list,
        phones: {
          create: [
            { label: 'Main Station', number: generatePhone(m.areaCode, m.rank * 10), isPrimary: true },
            { label: 'News Desk', number: generatePhone(m.areaCode, m.rank * 10 + 1), isPrimary: false },
          ],
        },
      },
    });
    count++;
  }

  console.log(`✅ Created ${count} TV markets with phone numbers`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
