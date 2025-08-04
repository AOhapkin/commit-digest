import { InteractiveSummary } from "./interactive-summary";

console.log("🚀 Commit Digest - Weekly Report Generator");
console.log("=".repeat(50));

const interactive = new InteractiveSummary();
interactive.start().catch(console.error);
