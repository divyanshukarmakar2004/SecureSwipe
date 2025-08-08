const fs = require("fs");
const path = require("path");

console.log("🔍 Backend Diagnostic Tool\n");

// Check Node.js version
console.log("1. Node.js Version:");
try {
  const nodeVersion = process.version;
  console.log(`   ✅ Node.js ${nodeVersion}`);
  if (parseInt(nodeVersion.slice(1).split(".")[0]) < 14) {
    console.log("   ⚠️  Warning: Node.js 14+ recommended");
  }
} catch (error) {
  console.log("   ❌ Error checking Node.js version");
}

// Check if package.json exists
console.log("\n2. Package.json:");
try {
  const packagePath = path.join(__dirname, "package.json");
  if (fs.existsSync(packagePath)) {
    console.log("   ✅ package.json found");
    const packageData = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    console.log(`   📦 Project: ${packageData.name}`);
  } else {
    console.log("   ❌ package.json not found");
  }
} catch (error) {
  console.log("   ❌ Error reading package.json");
}

// Check if node_modules exists
console.log("\n3. Dependencies:");
try {
  const nodeModulesPath = path.join(__dirname, "node_modules");
  if (fs.existsSync(nodeModulesPath)) {
    console.log("   ✅ node_modules found");
  } else {
    console.log('   ❌ node_modules not found - run "npm install"');
  }
} catch (error) {
  console.log("   ❌ Error checking node_modules");
}

// Check config.env
console.log("\n4. Environment Configuration:");
try {
  const configPath = path.join(__dirname, "config.env");
  if (fs.existsSync(configPath)) {
    console.log("   ✅ config.env found");
    const configContent = fs.readFileSync(configPath, "utf8");

    // Check for placeholder values
    if (configContent.includes("your-project-id")) {
      console.log("   ⚠️  Warning: Firebase credentials need to be updated");
    } else {
      console.log("   ✅ Firebase credentials appear to be configured");
    }
  } else {
    console.log("   ❌ config.env not found");
  }
} catch (error) {
  console.log("   ❌ Error reading config.env");
}

// Check Firebase config
console.log("\n5. Firebase Configuration:");
try {
  const firebaseConfigPath = path.join(__dirname, "config", "firebase.js");
  if (fs.existsSync(firebaseConfigPath)) {
    console.log("   ✅ Firebase config file found");
  } else {
    console.log("   ❌ Firebase config file not found");
  }
} catch (error) {
  console.log("   ❌ Error checking Firebase config");
}

// Check routes
console.log("\n6. API Routes:");
const routes = [
  "users.js",
  "transactions.js",
  "flaggedTransactions.js",
  "analytics.js",
];
routes.forEach((route) => {
  const routePath = path.join(__dirname, "routes", route);
  if (fs.existsSync(routePath)) {
    console.log(`   ✅ ${route} found`);
  } else {
    console.log(`   ❌ ${route} not found`);
  }
});

// Check server.js
console.log("\n7. Server File:");
try {
  const serverPath = path.join(__dirname, "server.js");
  if (fs.existsSync(serverPath)) {
    console.log("   ✅ server.js found");
  } else {
    console.log("   ❌ server.js not found");
  }
} catch (error) {
  console.log("   ❌ Error checking server.js");
}

console.log("\n🔧 Quick Fix Commands:");
console.log("   npm install          # Install dependencies");
console.log("   npm run dev          # Start development server");
console.log("   npm run seed         # Seed sample data");
console.log("   node diagnose.js     # Run this diagnostic again");

console.log("\n📋 Next Steps:");
console.log("   1. Update Firebase credentials in config.env");
console.log("   2. Run: npm install");
console.log("   3. Run: npm run seed");
console.log("   4. Run: npm run dev");
console.log("   5. Test: curl http://localhost:5000/health");


