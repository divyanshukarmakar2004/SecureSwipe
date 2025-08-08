const fetch = require("node-fetch");

const API_BASE_URL = "http://localhost:5000/api";

async function testAPI() {
  console.log("🧪 Testing Backend API...\n");

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

    // Test transactions endpoint
    console.log("\n3. Testing transactions endpoint...");
    const transactionsResponse = await fetch(`${API_BASE_URL}/transactions`);
    const transactionsData = await transactionsResponse.json();
    console.log(
      `✅ Transactions loaded: ${transactionsData.length} transactions`
    );

    // Test flagged transactions endpoint
    console.log("\n4. Testing flagged transactions endpoint...");
    const flaggedResponse = await fetch(`${API_BASE_URL}/flagged-transactions`);
    const flaggedData = await flaggedResponse.json();
    console.log(
      `✅ Flagged transactions loaded: ${flaggedData.length} flagged transactions`
    );

    // Test analytics endpoints
    console.log("\n5. Testing analytics endpoints...");
    const analyticsResponse = await fetch(
      `${API_BASE_URL}/analytics/dashboard-summary`
    );
    const analyticsData = await analyticsResponse.json();
    console.log("✅ Dashboard summary:", analyticsData);

    console.log(
      "\n🎉 All API tests passed! Backend is ready for frontend integration."
    );
  } catch (error) {
    console.error("❌ API test failed:", error.message);
    console.log("\n💡 Make sure the backend server is running:");
    console.log("   cd backend");
    console.log("   npm run dev");
  }
}

testAPI();

