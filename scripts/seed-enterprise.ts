#!/usr/bin/env tsx

/**
 * Seed Enterprise Organization Data
 * Creates test organization, admin user, and sample clients
 */

import { getDatabase, createUserProfile, getUserProfileByClerkId } from '../lib/db/index.js';
import {
  createOrganization,
  addOrganizationMember,
  createInviteToken,
} from '../lib/db/queries/enterprise.js';

const db = getDatabase();

console.log('🌱 Seeding enterprise organization data...\n');

try {
  // Create test organization
  console.log('📋 Creating organization: Smith Tax LLP');
  const orgId = createOrganization('Smith Tax LLP');
  console.log(`✅ Organization created with ID: ${orgId}\n`);

  // Create admin user
  console.log('👤 Creating admin user');
  const adminId = createUserProfile('admin_test_user', 'admin@smithtax.com');

  db.prepare(`
    UPDATE user_profiles
    SET first_name = 'John',
        last_name = 'Smith',
        us_state = 'CA',
        canada_province = 'BC',
        filing_status = 'single',
        subscription_tier = 'enterprise'
    WHERE id = ?
  `).run(adminId);

  console.log(`✅ Admin user created with ID: ${adminId}`);

  // Add admin to organization
  addOrganizationMember(orgId, adminId, 'admin');
  console.log(`✅ Admin added to organization\n`);

  // Create sample clients
  const clients = [
    {
      email: 'client1@example.com',
      firstName: 'Alice',
      lastName: 'Johnson',
      state: 'WA',
      province: 'ON',
      employer: 'Meta',
      rsuValue: 150000,
    },
    {
      email: 'client2@example.com',
      firstName: 'Bob',
      lastName: 'Williams',
      state: 'CA',
      province: 'BC',
      employer: 'Amazon',
      rsuValue: 200000,
    },
    {
      email: 'client3@example.com',
      firstName: 'Carol',
      lastName: 'Davis',
      state: 'NY',
      province: 'ON',
      employer: 'Google',
      rsuValue: 180000,
    },
  ];

  console.log('👥 Creating sample clients:');

  for (const client of clients) {
    const userId = createUserProfile(`client_${client.email}`, client.email);

    db.prepare(`
      UPDATE user_profiles
      SET first_name = ?,
          last_name = ?,
          us_state = ?,
          canada_province = ?,
          filing_status = 'single',
          subscription_tier = 'free'
      WHERE id = ?
    `).run(client.firstName, client.lastName, client.state, client.province, userId);

    // Add client to organization
    addOrganizationMember(orgId, userId, 'client');

    // Create sample RSU entry
    db.prepare(`
      INSERT INTO rsu_entries (user_id, vest_date, fmv_usd, shares, employer)
      VALUES (?, date('now'), ?, 1000, ?)
    `).run(userId, client.rsuValue / 1000, client.employer);

    // Create sample tax calculation
    const rsuEntry = db.prepare(`
      SELECT id FROM rsu_entries WHERE user_id = ? ORDER BY id DESC LIMIT 1
    `).get(userId) as { id: number };

    db.prepare(`
      INSERT INTO tax_calculations (
        rsu_entry_id, user_id, rsu_income_usd, rsu_income_cad, exchange_rate,
        us_federal_tax, us_state_tax, us_total_tax,
        canada_federal_tax, canada_provincial_tax, canada_total_tax,
        ftc_eligible_usd, ftc_claimed_cad, net_tax_payable, effective_tax_rate,
        tax_year
      ) VALUES (?, ?, ?, ?, 1.35, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.30, 2025)
    `).run(
      rsuEntry.id,
      userId,
      client.rsuValue,
      client.rsuValue * 1.35,
      client.rsuValue * 0.22,
      client.rsuValue * 0.05,
      client.rsuValue * 0.27,
      client.rsuValue * 0.15 * 1.35,
      client.rsuValue * 0.08 * 1.35,
      client.rsuValue * 0.23 * 1.35,
      client.rsuValue * 0.22,
      client.rsuValue * 0.22 * 1.35,
      client.rsuValue * 0.08 * 1.35
    );

    console.log(`  ✅ ${client.firstName} ${client.lastName} (${client.email})`);
  }

  // Create sample invite token
  console.log('\n📧 Creating sample invite token:');
  const invite = createInviteToken(orgId, 'newclient@example.com', 'client');
  const inviteUrl = `http://localhost:3000/enterprise/invite/${invite.token}`;
  console.log(`  ✅ Invite URL: ${inviteUrl}\n`);

  console.log('✨ Enterprise seeding complete!\n');
  console.log('📊 Summary:');
  console.log(`  - Organization: Smith Tax LLP (ID: ${orgId})`);
  console.log(`  - Admin: admin@smithtax.com`);
  console.log(`  - Clients: ${clients.length}`);
  console.log('\n🔗 Access the client dashboard at:');
  console.log('  http://localhost:3000/enterprise/clients\n');
} catch (error) {
  console.error('❌ Error seeding enterprise data:', error);
  process.exit(1);
}
