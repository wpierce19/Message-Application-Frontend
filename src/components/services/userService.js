import { secureFetch } from "../utils/secureFetch";

export const fetchUser = () => secureFetch("https://message-api-yidf.onrender.com/auth/me");

export const updateProfile = (form) =>
  secureFetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return secureFetch("https://message-api-yidf.onrender.com/profile/avatar", {
    method: "POST",
    body: formData,
  });
};

export const searchUsers = (query) =>
  secureFetch(`https://message-api-yidf.onrender.com/users?search=${encodeURIComponent(query)}`);

export const addFriend = (id) =>
  secureFetch(`https://message-api-yidf.onrender.com/friends/${id}`, { method: "POST" });