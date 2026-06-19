const { execSync } = require("child_process");

const isLite = process.argv.includes("--no-git");

console.log("====================================");
console.log("     🧪 SANITY CHECK (WAF LIB)      ");
console.log("====================================");

if (isLite) {
  console.log("           ⚡ LITE MODE ⚡");
  console.log("   (Git verification is disabled)");
}

//
// CLEAN DIST
//
console.log("\n🔍  Clean dist...");
execSync("npm run clean", { stdio: "inherit" });
console.log("✔️  Clean dist OK");

//
// TYPESCRIPT
//
console.log("\n🔍  TypeScript...");
execSync("tsc --noEmit", { stdio: "inherit" });
console.log("✔️  TypeScript OK");

//
// BUILD
//
console.log("\n🔍  Build...");
execSync("npm run build", { stdio: "inherit" });
console.log("✔️  Build OK");

//
// TESTS
//
console.log("\n🔍  Tests Jest...");
execSync("npm test", { stdio: "inherit" });
console.log("✔️  Tests Jest OK");

//
// GIT CHECK (FULL ONLY)
//
if (!isLite) {
  console.log("\n🔍  Git Status...");
  const gitStatus = execSync("git status --porcelain").toString().trim();

  if (gitStatus !== "") {
    console.error(
      "❌  Git FAILED — La branche contient des modifications non commit.",
    );
    process.exit(1);
  }

  console.log("✔️  Git Status OK");
}

console.log("\n🎉 SANITY CHECK COMPLETED");
