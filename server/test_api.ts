async function testApi() {
  const url = 'http://localhost:5000/api/generate-questions';
  const body = {
    userId: '2025f26d-f9be-4e9b-a653-325d5c26d9db',
    jobRole: 'Frontend Developer',
    companyType: 'Startup',
    difficulty: 'Medium',
    questionCount: 3
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("API Test Failed:", err.message);
  }
}

testApi();
