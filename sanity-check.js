#!/usr/bin/env node
const { execSync } = require("child_process");

function run(cmd, label) {
  try {
    console.log(`\n🔍  ${label}...`);
    execSync(cmd, { stdio: "inherit" });
    console.log(`✔️  ${label} OK`);
  } catch (err) {
    console.error(`❌  ${label} FAILED`);
    process.exit(1);
  }
}

function gitIsClean() {
  try {
    const status = execSync("git status --porcelain").toString().trim();
    return status.length === 0;
  } catch {
    return false;
  }
}

function getBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

console.log("====================================");
console.log("     🧪 SANITY CHECK (WAF LIB)      ");
console.log("====================================");

// 0) Clean dist
run("rimraf dist", "Clean dist");

// 1) TypeScript typecheck
run("tsc --noEmit", "TypeScript");

// 2) Build
run("npm run build", "Build");

// 3) Tests Jest
run("npm test --silent", "Tests Jest");

// 4) Git branch check
console.log(`\n🔍  Git Status...`);
const branch = getBranch();

if (!gitIsClean()) {
  console.error(
    `❌  Git FAILED — La branche '${branch}' contient des modifications non commit.`,
  );
  console.error("➡️  Fais un commit ou stash avant de lancer le sanity check.");
  process.exit(1);
}

console.log(`✔️  Git OK — Branche propre (${branch})`);

console.log("\n====================================");
console.log("   ✅ SANITY CHECK COMPLETED (OK)    ");
console.log("====================================\n");
