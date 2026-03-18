#!/usr/bin/env tsx
/**
 * Check for prospects that need follow-up
 *
 * Run this daily to identify:
 * 1. Replied prospects without demo scheduled (> 48 hours)
 * 2. Trials ending soon (within 3 days)
 */

import { getProspectsDueForFollowup, getTrialsEndingSoon } from '../lib/db/queries/enterprise-prospects';

async function checkFollowups() {
  console.log('🔍 Checking for follow-ups needed...\n');

  // Check for replied prospects without demos
  const needDemo = getProspectsDueForFollowup();

  if (needDemo.length > 0) {
    console.log(`⚠️  ${needDemo.length} prospects replied but no demo scheduled (> 48 hours):\n`);
    needDemo.forEach(prospect => {
      console.log(`  ${prospect.firm_name} (${prospect.city}, ${prospect.state})`);
      console.log(`    Reply date: ${prospect.reply_date}`);
      console.log(`    Days since reply: ${Math.floor((Date.now() - new Date(prospect.reply_date!).getTime()) / (1000 * 60 * 60 * 24))}`);
      console.log(`    Action: Schedule demo call ASAP`);
      console.log('');
    });
  } else {
    console.log('✅ No overdue demo follow-ups\n');
  }

  // Check for trials ending soon
  const endingSoon = getTrialsEndingSoon();

  if (endingSoon.length > 0) {
    console.log(`⚠️  ${endingSoon.length} trials ending within 3 days:\n`);
    endingSoon.forEach(prospect => {
      const daysUntilEnd = Math.ceil((new Date(prospect.trial_end_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      console.log(`  ${prospect.firm_name} (${prospect.city}, ${prospect.state})`);
      console.log(`    Trial ends: ${prospect.trial_end_date} (${daysUntilEnd} days)`);
      console.log(`    Started: ${prospect.trial_start_date}`);
      console.log(`    Action: Follow up about trial experience, discuss pricing`);
      console.log('');
    });
  } else {
    console.log('✅ No trials ending soon\n');
  }

  // Summary
  const totalActions = needDemo.length + endingSoon.length;
  if (totalActions === 0) {
    console.log('✨ All caught up! No immediate follow-ups needed.\n');
  } else {
    console.log(`📋 Total actions needed: ${totalActions}`);
    console.log(`   - Schedule demos: ${needDemo.length}`);
    console.log(`   - Trial check-ins: ${endingSoon.length}\n`);
  }
}

checkFollowups().catch(console.error);
