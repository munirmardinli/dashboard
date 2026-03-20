import { globalVars } from "./globalyVar";

let cookieCache: Record<string, unknown> | null = null;
let cookiePromise: Promise<Record<string, unknown>> | null = null;

export const cookieService = {
  async get(): Promise<Record<string, unknown>> {
    if (cookieCache) return cookieCache;
    if (cookiePromise) return cookiePromise;

    cookiePromise = fetch(`${globalVars.API_URL}/api/cookie`)
      .then(res => {
        if (!res.ok) throw new Error(`Cookie API Error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        cookieCache = data;
        cookiePromise = null;
        return data;
      })
      .catch(err => {
        console.error("cookieService: Failed to fetch cookie.json", err);
        cookiePromise = null;
        return {};
      });

    return cookiePromise;
  },

  async set(updates: Record<string, unknown>): Promise<void> {
    if (cookieCache) {
      cookieCache = { ...cookieCache, ...updates };
    }

    try {
      const res = await fetch(`${globalVars.API_URL}/api/cookie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`Cookie POST Error: ${res.status}`);
      const result = await res.json();
      if (result.success && result.data) {
          cookieCache = result.data;
      }
    } catch (err) {
      console.error("cookieService: Failed to save cookie.json", err);
    }
  },

  invalidate() {
    cookieCache = null;
  }
};
