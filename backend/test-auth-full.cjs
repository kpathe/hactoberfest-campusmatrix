const axios = require('axios');
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/campusmatrix');
  const db = mongoose.connection;
  const email = "realtest" + Date.now() + "@satiengg.in";

  try {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/signup', {
      name: "Test User", username: "realtest" + Date.now(), email, password: "Password123!", year: "1", roles: ["mentee"]
    });
    console.log("Signup res:", res.data);
  } catch(e) {
    console.log("Signup error:", e.response?.data || e.message);
  }

  const user = await db.collection('users').findOne({ email });
  if (!user) {
    console.log("User not found in DB!");
    process.exit(1);
  }
  
  const otp = user.emailVerificationOtp;
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/verify-email', { email, otp });
    console.log("Verify res:", res.data);
  } catch(e) {
    console.log("Verify error:", e.response?.data || e.message);
  }

  let cookie;
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/login', { email, password: "Password123!" });
    cookie = res.headers['set-cookie'];
    console.log("Login headers set-cookie:", cookie);
  } catch(e) {
    console.log("Login error:", e.response?.data || e.message);
  }

  try {
    const res = await axios.get('http://127.0.0.1:5000/api/auth/me', {
      headers: { Cookie: cookie[0].split(';')[0] }
    });
    console.log("Me res:", res.data.email);
  } catch(e) {
    console.log("Me error:", e.response?.data || e.message);
  }
  process.exit(0);
}
run();
