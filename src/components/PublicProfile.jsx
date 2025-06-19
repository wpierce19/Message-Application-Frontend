import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchPublicProfile } from "./services/userService"; // Adjust import

const PublicProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchPublicProfile(id).then(setUser).catch(console.error);
  }, [id]);

  return user ? (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded shadow">
        <img
            src={user.avatarUrl}
            alt="User Avatar"
            className="w-10 h-10 rounded-full object-cover border border-white"
        />
      <h2 className="text-xl font-bold text-gray-800">@{user.username}</h2>
      <p className="text-gray-600">Email: {user.email}</p>
      <p className="mt-2">{user.bio}</p>
      <p className="mt-1 text-sm text-gray-500">Interests: {user.interests.join(", ")}</p>
    </div>
  ) : (
    <p className="text-center mt-10 text-gray-500">Loading...</p>
  );
};

export default PublicProfile;