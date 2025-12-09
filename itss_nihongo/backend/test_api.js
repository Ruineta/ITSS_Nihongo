/**
 * Simple API Test Script
 * Tests the difficulty ranking endpoints
 * 
 * Usage: node test_api.js
 */

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Test utility
async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.status === expectedStatus) {
      console.log(`   ✅ Status: ${response.status} (Expected: ${expectedStatus})`);
      console.log(`   ✅ Response:`, JSON.stringify(data, null, 2).substring(0, 500) + '...');
      return { success: true, data };
    } else {
      console.log(`   ❌ Status: ${response.status} (Expected: ${expectedStatus})`);
      console.log(`   ❌ Response:`, data);
      return { success: false, data };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('========================================');
  console.log('🚀 API Test Suite - Difficulty Ranking');
  console.log('========================================');

  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/health`,
      status: 200
    },
    {
      name: 'API Root',
      url: `${BASE_URL}/api`,
      status: 200
    },
    {
      name: 'Get Difficult Slides (Default)',
      url: `${BASE_URL}/api/slides/ranking/difficult`,
      status: 200
    },
    {
      name: 'Get Difficult Slides (Limit 5)',
      url: `${BASE_URL}/api/slides/ranking/difficult?limit=5`,
      status: 200
    },
    {
      name: 'Get Difficult Slides (Min Score 80)',
      url: `${BASE_URL}/api/slides/ranking/difficult?minScore=80`,
      status: 200
    },
    {
      name: 'Get Difficult Slides (Pagination)',
      url: `${BASE_URL}/api/slides/ranking/difficult?limit=3&offset=3`,
      status: 200
    },
    {
      name: 'Get Difficulty Statistics',
      url: `${BASE_URL}/api/slides/ranking/difficult/stats`,
      status: 200
    },
    {
      name: 'Invalid Limit (Too High)',
      url: `${BASE_URL}/api/slides/ranking/difficult?limit=200`,
      status: 400
    },
    {
      name: 'Invalid Min Score',
      url: `${BASE_URL}/api/slides/ranking/difficult?minScore=150`,
      status: 400
    },
    {
      name: 'Not Found Route',
      url: `${BASE_URL}/api/invalid-route`,
      status: 404
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url, test.status);
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n========================================');
  console.log('📊 Test Results');
  console.log('========================================');
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  console.log('========================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests();
