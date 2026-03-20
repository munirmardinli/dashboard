import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { cwd } from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV !== "production") {
	const possiblePaths = [
		join(cwd(), ".env"),
		join(cwd(), "apps/api/.env"),
		join(__dirname, "../../.env")
	];

	for (const envPath of possiblePaths) {
		if (existsSync(envPath)) {
			console.log(`✅ Loading environment from: ${envPath}`);
			const content = readFileSync(envPath, "utf-8");
			for (const line of content.split("\n")) {
				const trimmed = line.trim();
				if (!trimmed || trimmed.startsWith("#")) continue;
				const [key, ...valueParts] = trimmed.split("=");
				if (!key) continue;
				let value = valueParts.join("=").trim();
				if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
					value = value.slice(1, -1);
				}
				const apiKey = key.trim();
				if (!process.env[apiKey]) {
					process.env[apiKey] = value;
				}
			}
			break;
		}
	}
}
