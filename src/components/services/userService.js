import { secureFetch } from "../utils/secureFetch";

export const fetchUser = () => secureFetch("https://message-api-yidf.onrender.com/auth/me");

export const updateProfile = (form) =>
  secureFetch("https://message-api-yidf.onrender.com/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

export const uploadAvatar = async (file) => {
  console.log("userService function uploadAvatar initiated.");
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

export const refreshUserData = async () => {
  const res = await fetch("https://message-api-yidf.onrender.com/auth/me", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
    },
  });

  if (!res.ok) throw new Error("Failed to refresh user data");
  const user = await res.json();
  localStorage.setItem("user", JSON.stringify(user));
  return user;
};