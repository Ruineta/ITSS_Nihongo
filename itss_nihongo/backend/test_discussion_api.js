/**
 * Test script for Discussion API endpoints
 * Run with: node test_discussion_api.js
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

// Helper function for colored console output
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test data
const testData = {
  slideId: 1,
  userId: 1,
  commentContent: 'この教材はとても分かりやすいです。第3章の例題が特に良いですね。',
  proposalContent: '「商積分」という表現は「不定積分」の方がいいのではないでしょうか？より標準的な用語だと思います。'
};

async function testDiscussionAPI() {
  try {
    log('\n====================================', 'blue');
    log('Discussion API Test Suite', 'blue');
    log('====================================\n', 'blue');

    // Test 1: Get slide discussion details
    log('Test 1: Get Slide Discussion Details', 'yellow');
    log('GET /api/discussions/slides/:slideId', 'yellow');
    try {
      const response = await fetch(
        `${API_BASE_URL}/discussions/slides/${testData.slideId}`
      );
      const data = await response.json();
      
      if (data.success) {
        log('✓ Success', 'green');
        log(`  Slide: ${data.data.slide.title}`);
        log(`  Comments: ${data.data.discussion.commentCount}`, 'reset');
      } else {
        log(`✗ Failed: ${data.message}`, 'red');
      }
    } catch (error) {
      log(`✗ Error: ${error.message}`, 'red');
    }

    // Test 2: Get slide comments
    log('\nTest 2: Get Slide Comments', 'yellow');
    log('GET /api/discussions/slides/:slideId/comments?page=1&limit=10', 'yellow');
    try {
      const response = await fetch(
        `${API_BASE_URL}/discussions/slides/${testData.slideId}/comments?page=1&limit=10`
      );
      const data = await response.json();
      
      if (data.success) {
        log('✓ Success', 'green');
        log(`  Total comments: ${data.pagination.totalItems}`);
        log(`  Current page: ${data.pagination.currentPage}/${data.pagination.totalPages}`, 'reset');
      } else {
        log(`✗ Failed: ${data.message}`, 'red');
      }
    } catch (error) {
      log(`✗ Error: ${error.message}`, 'red');
    }

    // Test 3: Create a comment
    log('\nTest 3: Create Comment', 'yellow');
    log('POST /api/discussions/slides/:slideId/comments', 'yellow');
    try {
      const response = await fetch(
        `${API_BASE_URL}/discussions/slides/${testData.slideId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: testData.commentContent,
            type: 'comment',
            userId: testData.userId
          })
        }
      );
      const data = await response.json();
      
      if (data.success) {
        log('✓ Success', 'green');
        log(`  Comment ID: ${data.data.id}`);
        log(`  Author: ${data.data.author}`, 'reset');
      } else {
        log(`✗ Failed: ${data.message}`, 'red');
      }
    } catch (error) {
      log(`✗ Error: ${error.message}`, 'red');
    }

    // Test 4: Create a proposal
    log('\nTest 4: Create Proposal (Teaching Plan)', 'yellow');
    log('POST /api/discussions/slides/:slideId/comments (type: proposal)', 'yellow');
    try {
      const response = await fetch(
        `${API_BASE_URL}/discussions/slides/${testData.slideId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: testData.proposalContent,
            type: 'proposal',
            userId: testData.userId
          })
        }
      );
      const data = await response.json();
      
      if (data.success) {
        log('✓ Success', 'green');
        log(`  Proposal ID: ${data.data.id}`);
        log(`  Type: ${data.data.type}`, 'reset');
      } else {
        log(`✗ Failed: ${data.message}`, 'red');
      }
    } catch (error) {
      log(`✗ Error: ${error.message}`, 'red');
    }

    // Test 5: Error handling - Invalid slide ID
    log('\nTest 5: Error Handling - Invalid Slide ID', 'yellow');
    log('GET /api/discussions/slides/9999', 'yellow');
    try {
      const response = await fetch(
        `${API_BASE_URL}/discussions/slides/9999`
      );
      const data = await response.json();
      
      if (!data.success) {
        log('✓ Error correctly returned', 'green');
        log(`  Message: ${data.message}`, 'reset');
      } else {
        log('✗ Expected error was not returned', 'red');
      }
    } catch (error) {
      log(`✗ Error: ${error.message}`, 'red');
    }

    // Test 6: Error handling - Empty comment
    log('\nTest 6: Error Handling - Empty Comment', 'yellow');
    log('POST /api/discussions/slides/:slideId/comments (empty content)', 'yellow');
    try {
      const response = await fetch(
        `${API_BASE_URL}/discussions/slides/${testData.slideId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: '',
            type: 'comment',
            userId: testData.userId
          })
        }
      );
      const data = await response.json();
      
      if (!data.success) {
        log('✓ Error correctly returned', 'green');
        log(`  Message: ${data.message}`, 'reset');
      } else {
        log('✗ Expected error was not returned', 'red');
      }
    } catch (error) {
      log(`✗ Error: ${error.message}`, 'red');
    }

    log('\n====================================', 'blue');
    log('Test Suite Completed', 'blue');
    log('====================================\n', 'blue');

  } catch (error) {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run tests
testDiscussionAPI();
