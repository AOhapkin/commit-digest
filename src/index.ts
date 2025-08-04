import { WeeklySummary } from "./weekly-summary";

console.log("🚀 Commit Digest - Weekly Report Generator");
console.log("Initializing...\n");

const summary = new WeeklySummary();

// Проверяем аргументы командной строки
const args = process.argv.slice(2);
const saveToFile = args.includes("--save") || args.includes("-s");
const outputPath = args
  .find((arg) => arg.startsWith("--output="))
  ?.split("=")[1];

summary.generateSummary({
  saveToFile,
  outputPath,
});
