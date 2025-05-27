import { authHeader } from "./authHeader";

export const secureFetch = async  (url, options = {}) => {
    try {
        const headers = {
            ...authHeader(),
            ...authHeader(options.headers || {}),
        };

        const response = await fetch(url, {...options, headers});

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        //try parsing JSON; fallback if empty
        const contentType = response.headers.get("Content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            return response;
        }
    } catch (err) {
        console.error(`secureFetch error -> ${url}`, err);
        throw err; //Let the catch caller handle it
    }
};