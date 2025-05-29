import { secureFetch } from "../utils/secureFetch";

export const fetchUserMessages = () => {
    secureFetch("/api/messages")
};

export const markMessageAsRead = (id) => {
    secureFetch(`/api/messages/${id}/read`, {
        method: "PATCH",
    });
};