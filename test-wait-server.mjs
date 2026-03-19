#!/usr/bin/env node
/**
 * Test the wait-for-server utility
 */

import { waitForServer } from './tests/utils/wait-for-server.js';

async function test() {
  console.log('Testing wait-for-server utility...');

  try {
    await waitForServer({
      url: 'http://localhost:3000',
      timeout: 30000,
      retryInterval: 500,
    });
    console.log('✅ Test passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
