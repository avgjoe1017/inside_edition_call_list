import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

// Time zone offset from EST
const timezoneOffsets: Record<string, number> = {
  'EST': 0,
  'CST': -1,
  'MST': -2,
  'PST': -3,
  'AKST': -4,
  'HST': -5,
};

// Convert time string to EST
function convertToEST(localTime: string, timezone: string): string {
  const offset = timezoneOffsets[timezone] || 0;

  // Parse time (e.g., "7:00 PM" or "6:30 PM")
  const match = localTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return localTime;

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  // Convert to 24-hour
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  // Apply offset to get EST
  hours -= offset;

  // Handle day overflow/underflow
  if (hours >= 24) hours -= 24;
  if (hours < 0) hours += 24;

  // Convert back to 12-hour format
  const newPeriod = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${displayHours}:${minutes} ${newPeriod}`;
}

async function main() {
  console.log('Migrating times to EST format...');

  // This is a fresh database after schema change, so we need to reseed
  // Let's just run the seed script
  console.log('Database schema updated. Please run: bun run seed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
