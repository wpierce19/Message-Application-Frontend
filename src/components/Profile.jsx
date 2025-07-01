import { useEffect, useState } from "react";
import {
  fetchUser,
  updateProfile,
  uploadAvatar,
} from "./services/userService";
import defaultAvatar from "../assets/default-avatar.png";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: "", interests: "" });

  useEffect(() => {
    fetchUser()
      .then((userData) => {
        setUser(userData);
        setForm({
          username: userData.username || "",
          bio: userData.bio || "",
          interests: userData.interests?.join(", ") || "",
          avatarUrl: userData.avatarUrl || defaultAvatar,
        });
      })
      .catch((err) => console.error("Failed to load user:", err));
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const updated = await updateProfile(form);
      setUser(updated);
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("File uploading initiated:");

    try {
      const { avatarUrl } = await uploadAvatar(file);
      setUser((prev) => ({ ...prev, avatarUrl }));
    } catch (err) {
      console.error("Error uploading avatar:", err);
    }
  };

  return user ? (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex items-center gap-4">
        <img
          src={
            user.avatarUrl
              ? (user.avatarUrl.startsWith("http")
                  ? user.avatarUrl
                  : `https://message-api-yidf.onrender.com${user.avatarUrl}`)
              : defaultAvatar
          }
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover"
        />
        <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
          Choose Image
          <input type="file" className="hidden" onChange={handleAvatarUpload} />
        </label>
      </div>

      {editing ? (
        <>
          <textarea
            className="w-full mt-4 p-2 border"
            placeholder="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <input
            className="w-full mt-2 p-2 border"
            placeholder="Interests (comma-separated)"
            value={form.interests}
            onChange={(e) => setForm({ ...form, interests: e.target.value })}
          />
          <button
            className="mt-2 bg-blue-600 text-white px-4 py-2"
            onClick={handleUpdateProfile}
          >
            Save
          </button>
        </>
      ) : (
        <>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">@{user.username}</h2>
          <p className="mt-2 text-gray-700">{user.bio}</p>
          <p className="mt-2 text-gray-600">
            Interests: {user.interests.join(", ")}
          </p>
          <button
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-gray-300"
            onClick={() =>
              setForm({
                bio: user.bio || "",
                interests: user.interests.join(", "),
              }) || setEditing(true)
            }
          >
            Edit Profile
          </button>
        </>
      )}
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default Profile;
