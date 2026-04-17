import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  VITE_API_URL:
    process.env.VITE_API_URL || "https://blood-management-bank-api.vercel.app",
  VITE_WEBSITE_NAME: process.env.VITE_WEBSITE_NAME || "BBMS",
};

const commands = [
  ["npm", ["run", "lint"]],
  ["npm", ["run", "test:run"]],
  ["npm", ["run", "build"]],
];

for (const [command, args] of commands) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
