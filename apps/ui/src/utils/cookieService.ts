import { CookieAPI } from "./api";

let cookieCache: Record<string, unknown> | null = null;
let cookiePromise: Promise<Record<string, unknown>> | null = null;

export const cookieService = {
  async get(): Promise<Record<string, unknown>> {
    if (cookieCache) return cookieCache;
    if (cookiePromise) return cookiePromise;

    cookiePromise = CookieAPI.get()
      .then((data) => {
        cookieCache = data;
        cookiePromise = null;
        return data;
      })
      .catch((err) => {
        console.error("cookieService: Failed to fetch cookie.json", err);
        cookiePromise = null;
        cookieCache = {};
        return {};
      });

    return cookiePromise;
  },

  async set(updates: Record<string, unknown>): Promise<void> {
    if (cookieCache) {
      cookieCache = { ...cookieCache, ...updates };
    }

    try {
      const next = await CookieAPI.set(updates);
      if (next) cookieCache = next;
    } catch (err) {
      console.error("cookieService: Failed to save cookie.json", err);
    }
  },

  invalidate() {
    cookieCache = null;
  }
};
