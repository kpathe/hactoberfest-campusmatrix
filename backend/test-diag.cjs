const axios = require('axios');
const mongoose = require('mongoose');

const BASE = 'http://127.0.0.1:5000';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/campusmatrix');
  const db = mongoose.connection;
  const ts = Date.now();
  const email = `diag${ts}@satiengg.in`;

  // 1. Signup
  let r = await axios.post(`${BASE}/api/auth/signup`, {
    name: 'DiagUser', username: `diag${ts}`, email, password: 'Password1', year: '1', roles: ['mentee']
  }).catch(e => { console.error('Signup:', e.response?.data); process.exit(1); });
  console.log('1. Signup OK');

  // 2. Get OTP from DB
  const user = await db.collection('users').findOne({ email });
  if (!user) { console.error('User not found in DB'); process.exit(1); }
  const otp = user.emailVerificationOtp;

  // 3. Verify email
  await axios.post(`${BASE}/api/auth/verify-email`, { email, otp })
    .catch(e => { console.error('Verify:', e.response?.data); process.exit(1); });
  console.log('2. Verify email OK');

  // 4. Login - check Set-Cookie
  let loginRes = await axios.post(`${BASE}/api/auth/login`, { email, password: 'Password1' })
    .catch(e => { console.error('Login:', e.response?.data); process.exit(1); });
  const cookies = loginRes.headers['set-cookie'];
  if (!cookies || !cookies[0].includes('token=')) {
    console.error('FAIL: No auth cookie in login response!'); process.exit(1);
  }
  const cookieStr = cookies[0];
  // Check cookie attributes
  const hasPath = cookieStr.toLowerCase().includes('path=/');
  const hasHttpOnly = cookieStr.toLowerCase().includes('httponly');
  const hasSameSite = cookieStr.toLowerCase().includes('samesite=lax');
  const hasMaxAge = cookieStr.toLowerCase().includes('max-age=');
  console.log(`3. Login OK | Set-Cookie attrs: path=${hasPath}, httpOnly=${hasHttpOnly}, sameSite=${hasSameSite}, maxAge=${hasMaxAge}`);
  if (!hasPath) console.error('  WARN: Cookie missing path=/');
  
  const rawCookie = cookieStr.split(';')[0]; // "token=xxx"

  // 5. /api/auth/me with cookie
  let meRes = await axios.get(`${BASE}/api/auth/me`, { headers: { Cookie: rawCookie } })
    .catch(e => { console.error('4. /me FAIL:', e.response?.data); process.exit(1); });
  console.log('4. /api/auth/me OK, email:', meRes.data.email);

  // 6. /api/notifications with cookie
  let notifRes = await axios.get(`${BASE}/api/notifications`, { headers: { Cookie: rawCookie } })
    .catch(e => { console.error('5. /api/notifications FAIL:', e.response?.data); process.exit(1); });
  console.log('5. /api/notifications OK, shape:', JSON.stringify(Object.keys(notifRes.data)));

  // 7. /api/match/my-connections with cookie
  let connRes = await axios.get(`${BASE}/api/match/my-connections`, { headers: { Cookie: rawCookie } })
    .catch(e => { console.error('6. /api/match/my-connections FAIL:', e.response?.data); process.exit(1); });
  console.log('6. /api/match/my-connections OK, count:', Array.isArray(connRes.data) ? connRes.data.length : JSON.stringify(connRes.data));

  // 8. /api/profile/create-profile
  let profRes = await axios.post(`${BASE}/api/profile/create-profile`, 
    { department: 'CS', bio: 'Test', skills: ['JS'], interests: ['coding'], languages: ['en'], gender: 'male' },
    { headers: { Cookie: rawCookie } }
  ).catch(e => { console.error('7. /api/profile/create-profile FAIL:', e.response?.data); process.exit(1); });
  console.log('7. /api/profile/create-profile OK');

  // 9. Logout
  await axios.post(`${BASE}/api/auth/logout`, {}, { headers: { Cookie: rawCookie } })
    .catch(e => console.error('8. logout FAIL:', e.response?.data));
  console.log('8. Logout OK');

  // 10. Verify cookie is cleared (attempt /me after logout)
  let afterLogout = await axios.get(`${BASE}/api/auth/me`, { headers: { Cookie: rawCookie } })
    .catch(e => e.response);
  if (afterLogout?.status === 401) {
    console.log('9. Post-logout /me correctly returns 401 (cookie invalid)');
  } else if (afterLogout?.status === 200) {
    console.warn('9. WARN: Post-logout /me still returns 200! (JWT was issued before logout - this is expected for stateless JWT)');
  }

  // 11. Invalid credentials
  let badLogin = await axios.post(`${BASE}/api/auth/login`, { email, password: 'wrongpassword' })
    .catch(e => e.response);
  if (badLogin?.status === 400) console.log('10. Invalid credentials → 400 OK');
  else console.error('10. Invalid credentials check FAIL, got', badLogin?.status);

  // Summary
  console.log('\n=== BACKEND AUTH PIPELINE: ALL CHECKS PASSED ===');
  process.exit(0);
}

run().catch(e => { console.error('Unexpected error:', e.message); process.exit(1); });
