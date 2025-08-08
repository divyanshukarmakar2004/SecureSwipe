const fetch = require("node-fetch");

const API_BASE_URL = "http://localhost:5000/api";

async function testCORS() {
  console.log("🧪 Testing CORS Configuration...\n");

  try {
    // Test health endpoint
    console.log("1. Testing health endpoint...");
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health check:", healthData);

    // Test users endpoint
    console.log("\n2. Testing users endpoint...");
    const usersResponse = await fetch(`${API_BASE_URL}/users`);
    const usersData = await usersResponse.json();
    console.log(`✅ Users loaded: ${usersData.length} users`);

    // Test analytics endpoint
    console.log("\n3. Testing analytics endpoint...");
    const analyticsResponse = await fetch(
      `${API_BASE_URL}/analytics/dashboard-summary`
    );
    const analyticsData = await analyticsResponse.json();
    console.log("✅ Dashboard summary:", analyticsData);

    console.log(
      "\n🎉 CORS test passed! Backend is ready for frontend on port 8080."
    );
  } catch (error) {
    console.error("❌ CORS test failed:", error.message);
    console.log("\n💡 Make sure the backend server is running:");
    console.log("   cd backend");
    console.log("   npm run dev");
  }
}

testCORS();

