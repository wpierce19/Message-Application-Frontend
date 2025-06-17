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
            return await response.json();
        } else {
            return response;
        }
    } catch (err) {
        console.error(`secureFetch error -> ${url}`, err);
        throw err;
    }
};