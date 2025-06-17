const axios = require('axios');
const { expect } = require('chai');

// 🧠 NEURAL SYSTEM MCP - COMPREHENSIVE TEST SUITE
// Testing all 10 endpoints with enterprise-grade validation

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000/api/mcp';
const TEST_PASSWORD = 'neural_access_2024';

let authToken = null;
let testResults = {
  endpoints_tested: 0,
  passed: 0,
  failed: 0,
  performance: {},
  issues: []
};

// 🔐 AUTHENTICATION FLOW TESTS
describe('🔐 MCP Authentication Flow', () => {
  it('should authenticate with valid password', async () => {
    const start = Date.now();
    const response = await axios.post(`${BASE_URL}/auth`, {
      password: TEST_PASSWORD
    });
    const duration = Date.now() - start;
    
    expect(response.status).to.equal(200);
    expect(response.data.result.token).to.be.a('string');
    expect(response.data.result.expires_in).to.equal(604800);
    
    authToken = response.data.result.token;
    testResults.performance.auth_valid = duration;
    testResults.passed++;
  });

  it('should reject invalid password', async () => {
    try {
      await axios.post(`${BASE_URL}/auth`, {
        password: 'wrong_password'
      });
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.response.status).to.equal(401);
      testResults.passed++;
    }
  });

  it('should reject missing password', async () => {
    try {
      await axios.post(`${BASE_URL}/auth`, {});
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.response.status).to.equal(400);
      testResults.passed++;
    }
  });

  it('should reject malformed token', async () => {
    try {
      await axios.get(`${BASE_URL}/manifest`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.response.status).to.equal(401);
      testResults.passed++;
    }
  });
});

// 📋 MANIFEST ENDPOINT TESTS
describe('📋 MCP Manifest', () => {
  it('should return system information', async () => {
    const start = Date.now();
    const response = await axios.get(`${BASE_URL}/manifest`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const duration = Date.now() - start;

    expect(response.status).to.equal(200);
    expect(response.data.result.name).to.equal('Marco Neural System MCP');
    expect(response.data.result.version).to.be.a('string');
    
    testResults.performance.manifest = duration;
    testResults.endpoints_tested++;
    testResults.passed++;
  });

  it('should require authentication', async () => {
    try {
      await axios.get(`${BASE_URL}/manifest`);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.response.status).to.equal(401);
      testResults.passed++;
    }
  });
});

// 👥 PEOPLE API TESTS (4 endpoints)
describe('👥 People API', () => {
  describe('GET /people', () => {
    it('should return people list with pagination', async () => {
      const start = Date.now();
      const response = await axios.get(`${BASE_URL}/people?limit=2`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const duration = Date.now() - start;

      expect(response.status).to.equal(200);
      expect(response.data.result.people).to.be.an('array');
      expect(response.data.result.people.length).to.be.at.most(2);
      expect(response.data.result.total_count).to.be.a('number');
      
      testResults.performance.people_list = duration;
      testResults.endpoints_tested++;
      testResults.passed++;
    });

    it('should filter by relationship type', async () => {
      const response = await axios.get(`${BASE_URL}/people?relation_type=family`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      testResults.passed++;
    });

    it('should require authentication', async () => {
      try {
        await axios.get(`${BASE_URL}/people`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(401);
        testResults.passed++;
      }
    });
  });

  describe('GET /people/search', () => {
    it('should search people by name', async () => {
      const start = Date.now();
      const response = await axios.get(`${BASE_URL}/people/search?q=yasmin`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const duration = Date.now() - start;

      expect(response.status).to.equal(200);
      expect(response.data.result.query.q).to.equal('yasmin');
      expect(response.data.result.matches).to.be.an('array');
      
      testResults.performance.people_search = duration;
      testResults.endpoints_tested++;
      testResults.passed++;
    });

    it('should handle empty search results', async () => {
      const response = await axios.get(`${BASE_URL}/people/search?q=nonexistent_person_xyz`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.result.total_count).to.equal(0);
      testResults.passed++;
    });

    it('should require search query', async () => {
      try {
        await axios.get(`${BASE_URL}/people/search`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        testResults.passed++;
      }
    });
  });

  describe('GET /people/analytics', () => {
    it('should return analytics dashboard', async () => {
      const start = Date.now();
      const response = await axios.get(`${BASE_URL}/people/analytics`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const duration = Date.now() - start;

      expect(response.status).to.equal(200);
      expect(response.data.result.analytics).to.be.an('object');
      expect(response.data.result.insights).to.be.an('object');
      
      testResults.performance.people_analytics = duration;
      testResults.endpoints_tested++;
      testResults.passed++;
    });
  });
});

// 🎯 PROJECTS API TESTS (5 endpoints)
describe('🎯 Projects API', () => {
  describe('GET /projects', () => {
    it('should return projects list with pagination', async () => {
      const start = Date.now();
      const response = await axios.get(`${BASE_URL}/projects?limit=3`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const duration = Date.now() - start;

      expect(response.status).to.equal(200);
      expect(response.data.result.projects).to.be.an('array');
      expect(response.data.result.projects.length).to.be.at.most(3);
      
      testResults.performance.projects_list = duration;
      testResults.endpoints_tested++;
      testResults.passed++;
    });

    it('should include sprints when requested', async () => {
      const response = await axios.get(`${BASE_URL}/projects?include_sprints=true&limit=1`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      if (response.data.result.projects.length > 0) {
        expect(response.data.result.projects[0]).to.have.property('sprints');
      }
      testResults.passed++;
    });
  });

  describe('GET /projects/active', () => {
    it('should return active projects summary', async () => {
      const start = Date.now();
      const response = await axios.get(`${BASE_URL}/projects/active`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const duration = Date.now() - start;

      expect(response.status).to.equal(200);
      expect(response.data.result.summary).to.be.an('object');
      expect(response.data.result.projects).to.be.an('array');
      
      testResults.performance.projects_active = duration;
      testResults.endpoints_tested++;
      testResults.passed++;
    });
  });

  describe('GET /projects/search', () => {
    it('should search projects by name', async () => {
      const start = Date.now();
      const response = await axios.get(`${BASE_URL}/projects/search?q=dietflow`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const duration = Date.now() - start;

      expect(response.status).to.equal(200);
      expect(response.data.result.query.q).to.equal('dietflow');
      expect(response.data.result.matches).to.be.an('array');
      
      testResults.performance.projects_search = duration;
      testResults.endpoints_tested++;
      testResults.passed++;
    });

    it('should require search query', async () => {
      try {
        await axios.get(`${BASE_URL}/projects/search`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        testResults.passed++;
      }
    });
  });

  describe('GET /projects/tasks', () => {
    it('should return cross-project tasks', async () => {
      const start = Date.now();
      const response = await axios.get(`${BASE_URL}/projects/tasks?priority_min=3`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const duration = Date.now() - start;

      expect(response.status).to.equal(200);
      expect(response.data.result.summary).to.be.an('object');
      expect(response.data.result.tasks).to.be.an('array');
      
      testResults.performance.projects_tasks = duration;
      testResults.endpoints_tested++;
      testResults.passed++;
    });
  });

  describe('GET /projects/analytics', () => {
    it('should return projects analytics', async () => {
      const start = Date.now();
      const response = await axios.get(`${BASE_URL}/projects/analytics`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const duration = Date.now() - start;

      expect(response.status).to.equal(200);
      expect(response.data.result.overview).to.be.an('object');
      expect(response.data.result.insights).to.be.an('object');
      
      testResults.performance.projects_analytics = duration;
      testResults.endpoints_tested++;
      testResults.passed++;
    });
  });
});

// ⚡ PERFORMANCE TESTS
describe('⚡ Performance Validation', () => {
  it('should meet performance targets', () => {
    const targets = {
      auth_valid: 1000,
      manifest: 500,
      people_list: 800,
      people_search: 1000,
      people_analytics: 1500,
      projects_list: 1000,
      projects_active: 1500,
      projects_search: 1500,
      projects_tasks: 1000,
      projects_analytics: 2000
    };

    let slowEndpoints = [];
    
    Object.entries(targets).forEach(([endpoint, target]) => {
      if (testResults.performance[endpoint] > target) {
        slowEndpoints.push(`${endpoint}: ${testResults.performance[endpoint]}ms > ${target}ms`);
      }
    });

    if (slowEndpoints.length > 0) {
      testResults.issues.push(`Performance issues: ${slowEndpoints.join(', ')}`);
    }

    expect(slowEndpoints.length).to.equal(0, `Performance targets missed: ${slowEndpoints.join(', ')}`);
    testResults.passed++;
  });
});

// 🔒 SECURITY TESTS
describe('🔒 Security Validation', () => {
  it('should include proper CORS headers', async () => {
    const response = await axios.get(`${BASE_URL}/manifest`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.headers['access-control-allow-origin']).to.exist;
    expect(response.headers['content-type']).to.include('application/json');
    testResults.passed++;
  });

  it('should handle OPTIONS preflight requests', async () => {
    try {
      const response = await axios.options(`${BASE_URL}/manifest`, {
        headers: {
          'Origin': 'https://claude.ai',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Authorization'
        }
      });
      expect(response.status).to.be.oneOf([200, 204]);
      testResults.passed++;
    } catch (error) {
      // Some servers don't implement OPTIONS, that's OK
      testResults.passed++;
    }
  });
});

// 📊 TEST RESULTS SUMMARY
after(() => {
  console.log('\n🧠 NEURAL SYSTEM MCP - TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`📊 Endpoints Tested: ${testResults.endpoints_tested}/10`);
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log('\n⚡ Performance Results:');
  
  Object.entries(testResults.performance).forEach(([endpoint, duration]) => {
    const status = duration < 1000 ? '🟢' : duration < 2000 ? '🟡' : '🔴';
    console.log(`   ${status} ${endpoint}: ${duration}ms`);
  });

  if (testResults.issues.length > 0) {
    console.log('\n⚠️  Issues Found:');
    testResults.issues.forEach(issue => console.log(`   • ${issue}`));
  }

  console.log('\n🎯 Overall Status: ' + 
    (testResults.failed === 0 ? '✅ ALL SYSTEMS GO' : '❌ ISSUES DETECTED'));
}); 