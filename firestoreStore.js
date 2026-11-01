const fs = require("fs");
const path = require("path");
const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const defaultServiceAccountPath = path.join(
  __dirname,
  "backend",
  "all-in-one-planner-8c46d-firebase-adminsdk-fbsvc-1f5cdce25a.json"
);
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  ? path.resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  : defaultServiceAccountPath;
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must contain the complete Firebase service-account JSON.");
  }
} else if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
} else {
  throw new Error(
    `Firebase service-account file was not found. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.`
  );
}
const app =
  getApps()[0] ||
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
const db = getFirestore(app);
db.settings({ ignoreUndefinedProperties: true });

const users = db.collection("plannerUsers");
const registrationChallenges = db.collection("plannerRegistrationChallenges");
const migrations = db.collection("plannerMetadata");
const auditEvents = db.collection("plannerAuditEvents");

function normalizedEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function documentId(email) {
  return Buffer.from(normalizedEmail(email)).toString("base64url");
}

async function getUser(email) {
  const snapshot = await users.doc(documentId(email)).get();
  return snapshot.exists ? snapshot.data() : null;
}

async function getUsers() {
  const snapshot = await users.get();
  return snapshot.docs.map((document) => document.data());
}

async function saveUser(user) {
  await users.doc(documentId(user.email)).set(user);
}

async function removeUser(email) {
  await users.doc(documentId(email)).delete();
}

async function recordAuditEvent(event) {
  await auditEvents.add({
    ...event,
    occurredAt: new Date().toISOString(),
  });
}

async function getAuditEvents(limit = 100) {
  const snapshot = await auditEvents
    .orderBy("occurredAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

async function getUserAuditEvents(email) {
  const snapshot = await auditEvents
    .where("targetEmail", "==", normalizedEmail(email))
    .get();
  return snapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }))
    .sort((a, b) => String(b.occurredAt || "").localeCompare(String(a.occurredAt || "")));
}

async function checkDatabase() {
  await migrations.limit(1).get();
}

async function getRegistrationChallenge(email) {
  const snapshot = await registrationChallenges.doc(documentId(email)).get();
  return snapshot.exists ? snapshot.data() : null;
}

async function saveRegistrationChallenge(challenge) {
  await registrationChallenges
    .doc(documentId(challenge.email))
    .set(challenge);
}

async function removeRegistrationChallenge(email) {
  await registrationChallenges.doc(documentId(email)).delete();
}

async function getMigrationMarker(name) {
  const snapshot = await migrations.doc(name).get();
  return snapshot.exists ? snapshot.data() : null;
}

async function importLegacyData({ users: legacyUsers = [], registrationChallenges: legacyChallenges = [] }) {
  const operations = [
    ...legacyUsers.map((user) => ({
      ref: users.doc(documentId(user.email)),
      data: user,
    })),
    ...legacyChallenges.map((challenge) => ({
      ref: registrationChallenges.doc(documentId(challenge.email)),
      data: challenge,
    })),
  ];

  for (let index = 0; index < operations.length; index += 450) {
    const batch = db.batch();
    operations.slice(index, index + 450).forEach(({ ref, data }) => {
      batch.set(ref, data);
    });
    await batch.commit();
  }

  await migrations.doc("legacyAppData").set({
    migratedAt: new Date().toISOString(),
    userCount: legacyUsers.length,
    registrationChallengeCount: legacyChallenges.length,
  });
}

module.exports = {
  db,
  checkDatabase,
  getAuditEvents,
  getUserAuditEvents,
  getMigrationMarker,
  getRegistrationChallenge,
  getUser,
  getUsers,
  importLegacyData,
  removeRegistrationChallenge,
  removeUser,
  recordAuditEvent,
  saveRegistrationChallenge,
  saveUser,
};
