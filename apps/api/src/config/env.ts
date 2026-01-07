import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";

if (process.env.NODE_ENV !== "production") {
	const envPath = join(cwd(), ".env");
	if (existsSync(envPath)) {
		for (const line of readFileSync(envPath, "utf-8").split("\n")) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const [key, ...valueParts] = trimmed.split("=");
			if (!key) continue;
			let value = valueParts.join("=").trim();
			if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
				value = value.slice(1, -1);
			}
			if (!process.env[key.trim()]) {
				process.env[key.trim()] = value;
			}
		}
	}
}
