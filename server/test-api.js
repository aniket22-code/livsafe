// Simple API test script
const BASE_URL = 'http://localhost:5000/api';

// Test health endpoint
async function testHealth() {
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    console.log('✅ Health Check:', data);
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
  }
}

// Test login
async function testLogin() {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'sarah.johnson@citygeneral.com',
        password: 'doctor123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login Success:', {
        user: data.data.fullName,
        email: data.data.email,
        type: data.data.type,
        token: data.token ? 'Token received' : 'No token'
      });
      return data.token;
    } else {
      console.error('❌ Login Failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Login Request Failed:', error.message);
    return null;
  }
}

// Test dashboard (requires authentication)
async function testDashboard(token) {
  try {
    const response = await fetch(`${BASE_URL}/doctor/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Dashboard Data:', {
        totalRecords: data.data.stats.totalRecords,
        monthlyRecords: data.data.stats.monthlyRecords,
        recentRecordsCount: data.data.recentRecords.length,
        gradeDistribution: data.data.gradeDistribution.length + ' grades'
      });
    } else {
      console.error('❌ Dashboard Failed:', data);
    }
  } catch (error) {
    console.error('❌ Dashboard Request Failed:', error.message);
  }
}

// Test patients list
async function testPatients(token) {
  try {
    const response = await fetch(`${BASE_URL}/patients`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Patients List:', {
        totalPatients: data.pagination.totalPatients,
        patientsOnPage: data.data.length,
        firstPatient: data.data[0]?.fullName || 'None'
      });
    } else {
      console.error('❌ Patients Request Failed:', data);
    }
  } catch (error) {
    console.error('❌ Patients Request Failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Testing Medical Assistant API...\n');
  
  await testHealth();
  console.log('');
  
  const token = await testLogin();
  console.log('');
  
  if (token) {
    await testDashboard(token);
    console.log('');
    
    await testPatients(token);
  }
  
  console.log('\n✨ API Testing Complete!');
}

runTests();
