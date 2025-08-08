require("dotenv").config({ path: "./config.env" });
const admin = require("firebase-admin");


function normalizePrivateKey(key) {
  if (!key) return key;
  let k = key;
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1);
  }
  return k.replace(/\\n/g, "\n");
}

function resolveDatabaseURL() {
  if (process.env.FIREBASE_DATABASE_URL)
    return process.env.FIREBASE_DATABASE_URL;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const region = process.env.FIREBASE_RTDB_REGION; 
  if (!projectId) return undefined;
  if (region) {
    return `https://${projectId}-default-rtdb.${region}.firebasedatabase.app`;
  }
  return `https://${projectId}-default-rtdb.firebaseio.com`;
}

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};


function validateEnv() {
  const missing = [];
  [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_PRIVATE_KEY",
    "FIREBASE_CLIENT_EMAIL",
  ].forEach((k) => {
    if (!process.env[k]) missing.push(k);
  });
  if (missing.length) {
    console.error("Missing required Firebase env vars:", missing.join(", "));
  }
}

validateEnv();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: resolveDatabaseURL(),
  });
}

const db = admin.database();

module.exports = { admin, db };


