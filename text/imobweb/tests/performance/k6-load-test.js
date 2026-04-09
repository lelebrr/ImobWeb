import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 Load Test - ImobWeb 2026
 * Benchmarks the Properties API and Search interface.
 */

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp-up to 20 users
    { duration: '1m', target: 50 },  // Stay at 50 users
    { duration: '30s', target: 0 },  // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // 1. Visit Home Page
  let res = http.get(`${BASE_URL}/`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);

  // 2. Search Properties
  res = http.get(`${BASE_URL}/api/properties?city=Sao%20Paulo&type=APARTAMENTO`);
  check(res, { 
    'search status is 200': (r) => r.status === 200,
    'search is fast': (r) => r.timings.duration < 300,
  });
  sleep(2);

  // 3. View Specific Property
  res = http.get(`${BASE_URL}/api/properties/prop-sample-123`);
  check(res, { 'property view is 200': (r) => r.status === 200 });
  sleep(1);
}
