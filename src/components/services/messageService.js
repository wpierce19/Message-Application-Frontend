import { secureFetch } from "../utils/secureFetch.js";

export const fetchUserMessages = async () => {
    secureFetch("https://message-api-yidf.onrender.com/messages")
};

export const markMessageAsRead = async (id) => {
    secureFetch(`https://message-api-yidf.onrender.com/messages/${id}/read`, {
        method: "PATCH",
    });
};