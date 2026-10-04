const axios = require('axios');

async function testAuth() {
  try {
    const signupRes = await axios.post('http://127.0.0.1:5000/api/auth/signup', {
      name: "Test User",
      username: "testuser999",
      email: "test999@satiengg.in",
      password: "Password123!",
      year: "1",
      roles: ["mentee"]
    });
    console.log("Signup:", signupRes.data);

    // Need to get the OTP from the DB to verify
    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://localhost:27017/campus_matrix');
    const db = mongoose.connection;
    const user = await db.collection('users').findOne({ email: "test999@satiengg.in" });
    console.log("Found user OTP:", user.emailVerificationOtp);

    const verifyRes = await axios.post('http://127.0.0.1:5000/api/auth/verify-email', {
      email: "test999@satiengg.in",
      otp: user.emailVerificationOtp
    });
    console.log("Verify:", verifyRes.data);

    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: "test999@satiengg.in",
      password: "Password123!"
    });
    
    console.log("Login headers:", loginRes.headers);
    const setCookie = loginRes.headers['set-cookie'];
    console.log("Set-Cookie:", setCookie);

    if (!setCookie) {
      console.error("NO COOKIE RECEIVED!");
      process.exit(1);
    }

    const meRes = await axios.get('http://127.0.0.1:5000/api/auth/me', {
      headers: {
        Cookie: setCookie[0].split(';')[0]
      }
    });
    console.log("Me response:", meRes.data.email);
    console.log("Auth success!");
    process.exit(0);

  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

testAuth();
