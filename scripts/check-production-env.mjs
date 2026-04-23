import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");

if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);
    process.env[key] ||= value;
  }
}

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_STARTER",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_AGENCY",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_APP_URL"
];

const missing = required.filter((key) => !process.env[key]);
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (missing.length) {
  console.error("Missing production environment variables:");
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

if (appUrl !== "https://portalkit.app") {
  console.warn(`NEXT_PUBLIC_APP_URL is '${appUrl}', expected 'https://portalkit.app' for production.`);
}

console.log("Production environment variables look ready.");
