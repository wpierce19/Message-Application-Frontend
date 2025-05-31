import { secureFetch } from "../utils/secureFetch.js";

export const fetchUserMessages = async () => {
    secureFetch("/api/messages")
};

export const markMessageAsRead = async (id) => {
    secureFetch(`/api/messages/${id}/read`, {
        method: "PATCH",
    });
};