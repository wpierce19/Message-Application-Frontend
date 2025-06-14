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

  return secureFetch("https://message-api-yidf.onrender.com/avatar", {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type; browser handles FormData boundary
  });
};

export const searchUsers = (query) =>
  secureFetch(`/api/users?search=${encodeURIComponent(query)}`);

export const addFriend = (id) =>
  secureFetch(`/api/friends/${id}`, { method: "POST" });