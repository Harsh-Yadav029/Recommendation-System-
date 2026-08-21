const axios = require('axios');

async function test() {
  try {
    const api = axios.create({
      baseURL: 'http://localhost:3000',
      withCredentials: true
    });

    // 1. Get session and CSRF token
    const res1 = await api.post('/api/auth/session');
    console.log("Session response:", res1.data);
    const csrfToken = res1.data.csrfToken;
    const cookies = res1.headers['set-cookie'];
    console.log("Cookies received:", cookies);

    // 2. Make request with CSRF token
    const res2 = await api.post('/api/recommend/retailrocket', 
      {
        user_profile: { user_id: "anonymous", history: [] },
        constraints: {}
      },
      {
        headers: {
          'Cookie': cookies.join('; '),
          'CSRF-Token': csrfToken
        }
      }
    );
    console.log("Recommend response:", res2.status);
  } catch (err) {
    if (err.response) {
      console.error("Error status:", err.response.status);
      console.error("Error data:", err.response.data);
    } else {
      console.error(err);
    }
  }
}

test();
