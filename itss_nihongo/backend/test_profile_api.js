/**
 * Test file for User Profile API endpoints
 * 
 * How to use:
 * 1. Make sure the backend server is running
 * 2. Update the USER_ID and TOKEN variables below
 * 3. Run: node backend/test_profile_api.js
 */

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
let TEST_USER_ID = null; // Will be set after login
let TEST_TOKEN = null; // Will be set after login
const TEST_USER_EMAIL = 'test@teacher.com';
const TEST_USER_PASSWORD = 'Test1234';

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (TEST_TOKEN && !options.noAuth) {
    headers['Authorization'] = `Bearer ${TEST_TOKEN}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error.message);
    return { status: 500, error: error.message };
  }
}

// Test functions
async function testLogin() {
  console.log('\n📝 Testing: POST /api/auth/login');
  console.log('Logging in with test user...');
  
  const result = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    }),
    noAuth: true
  });

  if (result.status === 200) {
    TEST_TOKEN = result.data.data.token;
    TEST_USER_ID = result.data.data.user.id;
    console.log('✅ Login successful');
    console.log(`   User ID: ${TEST_USER_ID}`);
    console.log(`   Token: ${TEST_TOKEN.substring(0, 20)}...`);
  } else {
    console.log('❌ Login failed:', result.data.message || result.error);
    console.log('   Please make sure you have a test user with:');
    console.log(`   Email: ${TEST_USER_EMAIL}`);
    console.log(`   Password: ${TEST_USER_PASSWORD}`);
    process.exit(1);
  }
}

async function testGetMyProfile() {
  console.log('\n📝 Testing: GET /api/users/profile/me');
  console.log('Getting authenticated user profile...');
  
  const result = await makeRequest('/users/profile/me', {
    method: 'GET'
  });

  if (result.status === 200) {
    console.log('✅ Success');
    console.log('   User:', result.data.data.user.fullName);
    console.log('   Email:', result.data.data.user.email);
    console.log('   Statistics:');
    console.log('   - Slides:', result.data.data.statistics.totalSlideCount);
    console.log('   - Articles:', result.data.data.statistics.totalArticleCount);
    console.log('   - Comments:', result.data.data.statistics.totalCommentCount);
    console.log('   - Likes received:', result.data.data.statistics.totalLikesReceived);
  } else {
    console.log('❌ Failed:', result.data.message || result.error);
  }
}

async function testGetUserProfile() {
  console.log('\n📝 Testing: GET /api/users/profile/:userId');
  console.log(`Getting public profile for user ID: ${TEST_USER_ID}...`);
  
  const result = await makeRequest(`/users/profile/${TEST_USER_ID}`, {
    method: 'GET',
    noAuth: true // Test public access
  });

  if (result.status === 200) {
    console.log('✅ Success (public access)');
    console.log('   User:', result.data.data.user.fullName);
    console.log('   School:', result.data.data.user.schoolName || 'N/A');
    console.log('   Specialization:', result.data.data.user.specialization || 'N/A');
    console.log('   Years of experience:', result.data.data.user.yearsOfExperience);
    console.log('   Statistics:');
    console.log('   - Public slides:', result.data.data.statistics.slideCount);
    console.log('   - Public articles:', result.data.data.statistics.articleCount);
  } else {
    console.log('❌ Failed:', result.data.message || result.error);
  }
}

async function testUpdateProfile() {
  console.log('\n📝 Testing: PUT /api/users/profile');
  console.log('Updating profile...');
  
  const updateData = {
    full_name: 'Test Teacher (Updated)',
    school_name: 'Test University',
    specialization: 'Japanese Language Education',
    years_of_experience: 5
  };

  const result = await makeRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });

  if (result.status === 200) {
    console.log('✅ Success');
    console.log('   Updated name:', result.data.data.user.fullName);
    console.log('   Updated school:', result.data.data.user.schoolName);
    console.log('   Updated specialization:', result.data.data.user.specialization);
    console.log('   Updated experience:', result.data.data.user.yearsOfExperience, 'years');
  } else {
    console.log('❌ Failed:', result.data.message || result.error);
  }
}

async function testGetUserSlides() {
  console.log('\n📝 Testing: GET /api/users/profile/:userId/slides');
  console.log(`Getting slides for user ID: ${TEST_USER_ID}...`);
  
  const result = await makeRequest(`/users/profile/${TEST_USER_ID}/slides?limit=5`, {
    method: 'GET',
    noAuth: true
  });

  if (result.status === 200) {
    console.log('✅ Success');
    console.log('   Total slides:', result.data.data.pagination.total);
    console.log('   Showing:', result.data.data.slides.length, 'slides');
    if (result.data.data.slides.length > 0) {
      console.log('   First slide:', result.data.data.slides[0].title);
    }
  } else {
    console.log('❌ Failed:', result.data.message || result.error);
  }
}

async function testGetUserArticles() {
  console.log('\n📝 Testing: GET /api/users/profile/:userId/articles');
  console.log(`Getting articles for user ID: ${TEST_USER_ID}...`);
  
  const result = await makeRequest(`/users/profile/${TEST_USER_ID}/articles?limit=5`, {
    method: 'GET',
    noAuth: true
  });

  if (result.status === 200) {
    console.log('✅ Success');
    console.log('   Total articles:', result.data.data.pagination.total);
    console.log('   Showing:', result.data.data.articles.length, 'articles');
    if (result.data.data.articles.length > 0) {
      console.log('   First article:', result.data.data.articles[0].title);
    }
  } else {
    console.log('❌ Failed:', result.data.message || result.error);
  }
}

async function testInvalidUserId() {
  console.log('\n📝 Testing: GET /api/users/profile/:userId (with invalid ID)');
  console.log('Testing with invalid user ID: 99999...');
  
  const result = await makeRequest('/users/profile/99999', {
    method: 'GET',
    noAuth: true
  });

  if (result.status === 404) {
    console.log('✅ Correctly returned 404 for invalid user');
  } else {
    console.log('❌ Expected 404, got:', result.status);
  }
}

async function testUpdateProfileWithoutAuth() {
  console.log('\n📝 Testing: PUT /api/users/profile (without authentication)');
  console.log('Testing update without auth token...');
  
  const result = await makeRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify({
      full_name: 'Unauthorized User'
    }),
    noAuth: true
  });

  if (result.status === 401 || result.status === 403) {
    console.log('✅ Correctly rejected unauthorized request');
  } else {
    console.log('❌ Expected 401/403, got:', result.status);
  }
}

// Main test runner
async function runAllTests() {
  console.log('===========================================');
  console.log('🧪 User Profile API Test Suite');
  console.log('===========================================');
  console.log(`Base URL: ${BASE_URL}`);

  try {
    // Authentication test
    await testLogin();

    if (!TEST_TOKEN) {
      console.log('\n❌ Cannot proceed without authentication token');
      return;
    }

    // Profile tests
    await testGetMyProfile();
    await testGetUserProfile();
    await testUpdateProfile();
    await testGetUserSlides();
    await testGetUserArticles();

    // Error handling tests
    await testInvalidUserId();
    await testUpdateProfileWithoutAuth();

    console.log('\n===========================================');
    console.log('✅ All tests completed!');
    console.log('===========================================');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error(error.stack);
  }
}

// Run tests
runAllTests();
