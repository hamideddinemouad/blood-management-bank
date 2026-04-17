import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import swaggerSpec from "./spec.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, "openapi.generated.json");

fs.writeFileSync(outputPath, `${JSON.stringify(swaggerSpec, null, 2)}\n`, "utf8");
console.log(`OpenAPI spec generated at ${outputPath}`);
