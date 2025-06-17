const axios = require('axios');
const { performance } = require('perf_hooks');

// 🧠 NEURAL SYSTEM MCP - PERFORMANCE BENCHMARK SUITE
// Comprehensive load testing and performance analysis

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000/api/mcp';
const TEST_PASSWORD = 'neural_access_2024';
const CONCURRENT_USERS = 10;
const TOTAL_REQUESTS = 100;
const TEST_DURATION = 30000; // 30 seconds

let authToken = null;
let benchmarkResults = {
  endpoints: {},
  overall: {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalDuration: 0,
    averageResponseTime: 0,
    requestsPerSecond: 0
  },
  performance: {
    memory: {},
    errors: []
  }
};

// 🔐 Authentication
async function authenticate() {
  console.log('🔐 Authenticating...');
  try {
    const response = await axios.post(`${BASE_URL}/auth`, {
      password: TEST_PASSWORD
    });
    authToken = response.data.result.token;
    console.log('✅ Authentication successful');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    return false;
  }
}

// 📊 Performance measurement utility
function measurePerformance(fn, label) {
  return async (...args) => {
    const start = performance.now();
    const memBefore = process.memoryUsage();
    
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      const memAfter = process.memoryUsage();
      
      // Record metrics
      if (!benchmarkResults.endpoints[label]) {
        benchmarkResults.endpoints[label] = {
          requests: 0,
          totalTime: 0,
          minTime: Infinity,
          maxTime: 0,
          errors: 0,
          responseTimes: [],
          memoryDelta: []
        };
      }
      
      const endpoint = benchmarkResults.endpoints[label];
      endpoint.requests++;
      endpoint.totalTime += duration;
      endpoint.minTime = Math.min(endpoint.minTime, duration);
      endpoint.maxTime = Math.max(endpoint.maxTime, duration);
      endpoint.responseTimes.push(duration);
      endpoint.memoryDelta.push(memAfter.heapUsed - memBefore.heapUsed);
      
      benchmarkResults.overall.totalRequests++;
      benchmarkResults.overall.successfulRequests++;
      benchmarkResults.overall.totalDuration += duration;
      
      return { success: true, duration, result };
    } catch (error) {
      const duration = performance.now() - start;
      
      if (!benchmarkResults.endpoints[label]) {
        benchmarkResults.endpoints[label] = {
          requests: 0,
          totalTime: 0,
          minTime: Infinity,
          maxTime: 0,
          errors: 0,
          responseTimes: [],
          memoryDelta: []
        };
      }
      
      benchmarkResults.endpoints[label].errors++;
      benchmarkResults.overall.totalRequests++;
      benchmarkResults.overall.failedRequests++;
      benchmarkResults.performance.errors.push({
        endpoint: label,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      return { success: false, duration, error: error.message };
    }
  };
}

// 🎯 Test endpoint definitions
const testEndpoints = [
  {
    name: 'manifest',
    fn: () => axios.get(`${BASE_URL}/manifest`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  },
  {
    name: 'people_list',
    fn: () => axios.get(`${BASE_URL}/people?limit=5`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  },
  {
    name: 'people_search',
    fn: () => axios.get(`${BASE_URL}/people/search?q=yasmin`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  },
  {
    name: 'people_analytics',
    fn: () => axios.get(`${BASE_URL}/people/analytics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  },
  {
    name: 'projects_list',
    fn: () => axios.get(`${BASE_URL}/projects?limit=5`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  },
  {
    name: 'projects_active',
    fn: () => axios.get(`${BASE_URL}/projects/active`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  },
  {
    name: 'projects_search',
    fn: () => axios.get(`${BASE_URL}/projects/search?q=dietflow`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  },
  {
    name: 'projects_tasks',
    fn: () => axios.get(`${BASE_URL}/projects/tasks?priority_min=3`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  },
  {
    name: 'projects_analytics',
    fn: () => axios.get(`${BASE_URL}/projects/analytics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  }
];

// 🔥 Single endpoint benchmark
async function benchmarkEndpoint(endpoint, iterations = 10) {
  console.log(`\n🎯 Benchmarking ${endpoint.name} (${iterations} requests)...`);
  
  const measuredFn = measurePerformance(endpoint.fn, endpoint.name);
  const promises = [];
  
  for (let i = 0; i < iterations; i++) {
    promises.push(measuredFn());
    
    // Add small delay to prevent overwhelming the server
    if (i % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  await Promise.all(promises);
  
  const stats = benchmarkResults.endpoints[endpoint.name];
  const avgTime = stats.totalTime / stats.requests;
  const successRate = ((stats.requests - stats.errors) / stats.requests) * 100;
  
  console.log(`   ⏱️  Avg Response: ${avgTime.toFixed(2)}ms`);
  console.log(`   📊 Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`   🚀 Min: ${stats.minTime.toFixed(2)}ms | Max: ${stats.maxTime.toFixed(2)}ms`);
}

// 🌊 Load testing with concurrent users
async function loadTest() {
  console.log(`\n🌊 Load Testing: ${CONCURRENT_USERS} concurrent users for ${TEST_DURATION/1000}s...`);
  
  const startTime = Date.now();
  const workers = [];
  
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    const worker = async () => {
      while (Date.now() - startTime < TEST_DURATION) {
        // Randomly select endpoint for realistic load distribution
        const endpoint = testEndpoints[Math.floor(Math.random() * testEndpoints.length)];
        const measuredFn = measurePerformance(endpoint.fn, `load_${endpoint.name}`);
        
        await measuredFn();
        
        // Random delay between requests (100-500ms)
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
      }
    };
    
    workers.push(worker());
  }
  
  await Promise.all(workers);
  
  const duration = (Date.now() - startTime) / 1000;
  benchmarkResults.overall.requestsPerSecond = benchmarkResults.overall.totalRequests / duration;
  
  console.log(`   ⚡ Requests/sec: ${benchmarkResults.overall.requestsPerSecond.toFixed(2)}`);
  console.log(`   ✅ Success: ${benchmarkResults.overall.successfulRequests}`);
  console.log(`   ❌ Errors: ${benchmarkResults.overall.failedRequests}`);
}

// 🧮 Statistical analysis
function calculatePercentiles(responseTimes) {
  const sorted = [...responseTimes].sort((a, b) => a - b);
  const len = sorted.length;
  
  return {
    p50: sorted[Math.floor(len * 0.5)] || 0,
    p90: sorted[Math.floor(len * 0.9)] || 0,
    p95: sorted[Math.floor(len * 0.95)] || 0,
    p99: sorted[Math.floor(len * 0.99)] || 0
  };
}

// 📈 Generate comprehensive report
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('🧠 NEURAL SYSTEM MCP - PERFORMANCE REPORT');
  console.log('='.repeat(60));
  
  // Overall metrics
  console.log('\n📊 OVERALL PERFORMANCE:');
  console.log(`   Total Requests: ${benchmarkResults.overall.totalRequests}`);
  console.log(`   Success Rate: ${((benchmarkResults.overall.successfulRequests / benchmarkResults.overall.totalRequests) * 100).toFixed(1)}%`);
  console.log(`   Avg Response Time: ${(benchmarkResults.overall.totalDuration / benchmarkResults.overall.totalRequests).toFixed(2)}ms`);
  console.log(`   Requests per Second: ${benchmarkResults.overall.requestsPerSecond.toFixed(2)}`);
  
  // Performance targets comparison
  const targets = {
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
  
  console.log('\n⏱️  ENDPOINT PERFORMANCE vs TARGETS:');
  Object.entries(benchmarkResults.endpoints).forEach(([name, stats]) => {
    if (stats.requests === 0) return;
    
    const cleanName = name.replace('load_', '');
    const avgTime = stats.totalTime / stats.requests;
    const target = targets[cleanName] || 1000;
    const status = avgTime <= target ? '🟢' : avgTime <= target * 1.5 ? '🟡' : '🔴';
    const percentiles = calculatePercentiles(stats.responseTimes);
    
    console.log(`   ${status} ${cleanName}: ${avgTime.toFixed(2)}ms (target: ${target}ms)`);
    console.log(`     Min: ${stats.minTime.toFixed(2)}ms | Max: ${stats.maxTime.toFixed(2)}ms`);
    console.log(`     p50: ${percentiles.p50.toFixed(2)}ms | p95: ${percentiles.p95.toFixed(2)}ms | p99: ${percentiles.p99.toFixed(2)}ms`);
    console.log(`     Requests: ${stats.requests} | Errors: ${stats.errors}`);
    console.log('');
  });
  
  // Memory analysis
  console.log('💾 MEMORY USAGE:');
  const currentMem = process.memoryUsage();
  console.log(`   Heap Used: ${(currentMem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Heap Total: ${(currentMem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   RSS: ${(currentMem.rss / 1024 / 1024).toFixed(2)} MB`);
  
  // Error analysis
  if (benchmarkResults.performance.errors.length > 0) {
    console.log('\n❌ ERRORS DETECTED:');
    benchmarkResults.performance.errors.forEach(error => {
      console.log(`   • ${error.endpoint}: ${error.error}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  Object.entries(benchmarkResults.endpoints).forEach(([name, stats]) => {
    if (stats.requests === 0) return;
    
    const cleanName = name.replace('load_', '');
    const avgTime = stats.totalTime / stats.requests;
    const target = targets[cleanName] || 1000;
    const errorRate = (stats.errors / stats.requests) * 100;
    
    if (avgTime > target * 1.5) {
      console.log(`   🔴 ${cleanName}: Critical performance issue (${avgTime.toFixed(2)}ms > ${target * 1.5}ms)`);
    } else if (avgTime > target) {
      console.log(`   🟡 ${cleanName}: Performance needs improvement (${avgTime.toFixed(2)}ms > ${target}ms)`);
    }
    
    if (errorRate > 5) {
      console.log(`   ⚠️  ${cleanName}: High error rate (${errorRate.toFixed(1)}%)`);
    }
  });
  
  // System status
  const overallSuccessRate = (benchmarkResults.overall.successfulRequests / benchmarkResults.overall.totalRequests) * 100;
  const overallAvgTime = benchmarkResults.overall.totalDuration / benchmarkResults.overall.totalRequests;
  
  console.log('\n🎯 SYSTEM STATUS:');
  if (overallSuccessRate >= 99 && overallAvgTime <= 1000 && benchmarkResults.overall.requestsPerSecond >= 10) {
    console.log('   ✅ EXCELLENT - System performing optimally');
  } else if (overallSuccessRate >= 95 && overallAvgTime <= 2000 && benchmarkResults.overall.requestsPerSecond >= 5) {
    console.log('   🟡 GOOD - System performing within acceptable limits');
  } else {
    console.log('   🔴 NEEDS ATTENTION - System performance issues detected');
  }
  
  console.log('\n' + '='.repeat(60));
}

// 🚀 Main benchmark execution
async function runBenchmarks() {
  console.log('🧠 NEURAL SYSTEM MCP - PERFORMANCE BENCHMARK');
  console.log('Starting comprehensive performance analysis...\n');
  
  // Authenticate
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.error('❌ Cannot proceed without authentication');
    process.exit(1);
  }
  
  // Record initial memory state
  benchmarkResults.performance.memory.initial = process.memoryUsage();
  
  try {
    // Individual endpoint benchmarks
    console.log('📋 Phase 1: Individual Endpoint Benchmarks');
    for (const endpoint of testEndpoints) {
      await benchmarkEndpoint(endpoint, 10);
    }
    
    // Load testing
    console.log('\n📋 Phase 2: Load Testing');
    await loadTest();
    
    // Memory after tests
    benchmarkResults.performance.memory.final = process.memoryUsage();
    
    // Generate report
    generateReport();
    
    // Save results to file
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `benchmark-results-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(benchmarkResults, null, 2));
    console.log(`\n💾 Results saved to: ${filename}`);
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Benchmark interrupted by user');
  generateReport();
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  runBenchmarks().catch(console.error);
}

module.exports = {
  runBenchmarks,
  benchmarkEndpoint,
  loadTest,
  generateReport
}; 