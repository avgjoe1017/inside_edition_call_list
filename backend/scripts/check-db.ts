/**
 * Quick database check script
 * Run with: bun run scripts/check-db.ts
 */

import { db } from '../src/db';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...\n');

    // Check total markets
    const totalMarkets = await db.market.count();
    console.log(`📊 Total Markets: ${totalMarkets}`);

    // Check markets by feed
    const threePmCount = await db.market.count({ where: { list: '3pm' } });
    const fivePmCount = await db.market.count({ where: { list: '5pm' } });
    const sixPmCount = await db.market.count({ where: { list: '6pm' } });

    console.log(`  📺 3PM Feed: ${threePmCount} markets`);
    console.log(`  📺 5PM Feed: ${fivePmCount} markets`);
    console.log(`  📺 6PM Feed: ${sixPmCount} markets`);

    // Check phone numbers
    const totalPhones = await db.phoneNumber.count();
    console.log(`\n📞 Total Phone Numbers: ${totalPhones}`);

    // Check recent activity
    const recentCallLogs = await db.callLog.count();
    const recentAlertLogs = await db.alertLog.count();
    const recentEditLogs = await db.editLog.count();

    console.log(`\n📋 Activity Logs:`);
    console.log(`  📞 Call Logs: ${recentCallLogs}`);
    console.log(`  📢 Alert Logs: ${recentAlertLogs}`);
    console.log(`  ✏️  Edit Logs: ${recentEditLogs}`);

    // Show sample markets from each feed
    console.log(`\n📺 Sample Markets:`);
    
    const sample3pm = await db.market.findFirst({
      where: { list: '3pm' },
      include: { phones: true }
    });
    if (sample3pm) {
      console.log(`  3PM: ${sample3pm.name} (Market #${sample3pm.marketNumber}) - ${sample3pm.phones.length} phones`);
    }

    const sample5pm = await db.market.findFirst({
      where: { list: '5pm' },
      include: { phones: true }
    });
    if (sample5pm) {
      console.log(`  5PM: ${sample5pm.name} (Market #${sample5pm.marketNumber}) - ${sample5pm.phones.length} phones`);
    }

    const sample6pm = await db.market.findFirst({
      where: { list: '6pm' },
      include: { phones: true }
    });
    if (sample6pm) {
      console.log(`  6PM: ${sample6pm.name} (Market #${sample6pm.marketNumber}) - ${sample6pm.phones.length} phones`);
    }

    console.log('\n✅ Database check complete!\n');

    // Connection info
    console.log('🔗 Database Connection:');
    console.log(`   ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite (dev.db)'}`);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkDatabase();
