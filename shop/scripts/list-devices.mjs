import { SquareClient, SquareEnvironment } from "square";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
}

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox,
});

const response = await client.devices.list({ sortOrder: "ASC" });
const devices = response.devices ?? [];

if (devices.length === 0) {
  console.log("No devices found. Make sure your Terminal is paired in the Square Dashboard.");
} else {
  for (const d of devices) {
    console.log(`Name:   ${d.name ?? "(unnamed)"}`);
    console.log(`ID:     ${d.id}`);
    console.log(`Status: ${d.status?.category ?? "unknown"}`);
    console.log("---");
  }
}
