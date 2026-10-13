const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const projectRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(projectRoot, "backend", ".env") });

const {
  getMigrationMarker,
  getUsers,
  importLegacyData,
} = require("../firestoreStore");

async function main() {
  const dataPath = path.join(projectRoot, "data", "app-data.json");
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Legacy user data file was not found at ${dataPath}.`);
  }

  const legacyData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  if (
    !legacyData ||
    !Array.isArray(legacyData.users) ||
    !Array.isArray(legacyData.registrationChallenges || [])
  ) {
    throw new Error("Legacy user data file has an unexpected format.");
  }

  const marker = await getMigrationMarker("legacyAppData");
  if (marker && !process.argv.includes("--force")) {
    throw new Error(
      `Migration already completed at ${marker.migratedAt}. Use --force only if you intend to import and overwrite matching user records.`
    );
  }

  if (!marker) {
    const existingUsers = await getUsers();
    if (existingUsers.length && !process.argv.includes("--force")) {
      throw new Error(
        `Firestore already contains ${existingUsers.length} user records. Use --force only after confirming you want matching records overwritten.`
      );
    }
  }

  await importLegacyData({
    users: legacyData.users,
    registrationChallenges: legacyData.registrationChallenges || [],
  });
  console.log(
    `Imported ${legacyData.users.length} users and ${
      (legacyData.registrationChallenges || []).length
    } registration challenges to Firestore. The original data file was left unchanged.`
  );
}

main().catch((error) => {
  console.error(`Firestore migration failed: ${error.message}`);
  process.exitCode = 1;
});
