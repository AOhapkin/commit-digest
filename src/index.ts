import { WeeklySummary } from "./weekly-summary";

console.log("🚀 Commit Digest - Weekly Report Generator");
console.log("Initializing...\n");

// Проверяем аргументы командной строки
const args = process.argv.slice(2);
const saveToFile = args.includes("--save") || args.includes("-s");
const outputPath = args
  .find((arg) => arg.startsWith("--output="))
  ?.split("=")[1];
const repoPath = args.find((arg) => arg.startsWith("--repo="))?.split("=")[1];

const summary = new WeeklySummary(repoPath);

summary.generateSummary({
  saveToFile,
  outputPath,
  repoPath,
});
