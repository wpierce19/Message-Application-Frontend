import { authHeader } from "./authHeader";

export const secureFetch = async (url, options = {}) => {
    try {
        const headers = {
            ...authHeader(),               // inject Authorization header
            ...(options.headers || {}),   // merge with user-provided headers
        };

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
        const raw = await response.text();
        return JSON.parse(raw);
        }

    } catch (err) {
        console.error(`secureFetch error -> ${url}`, err);
        throw err;
    }
};