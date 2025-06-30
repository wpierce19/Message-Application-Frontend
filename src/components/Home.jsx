import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { fetchUserMessages } from "./services/messageService.js";
import { secureFetch } from "./utils/secureFetch.js";
import { toast } from "react-hot-toast";

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [recentMessages, setRecentMessages] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [friendSuggestions, setFriendSuggestions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchUserMessages()
      .then((msgs) => setRecentMessages(msgs.slice(0, 5)))
      .catch((err) => console.error("Failed to load messages:", err));

    secureFetch("https://message-api-yidf.onrender.com/friends")
      .then(setFriends)
      .catch((err) => console.error("Failed to load friends:", err));

    secureFetch("https://message-api-yidf.onrender.com/friends/requests")
      .then(setPendingRequests)
      .catch((err) => console.error("Failed to load friend requests:", err));
  }, []);

  const searchFriends = async (query) => {
    if (!query) return setFriendSuggestions([]);
    try {
      const response = await secureFetch(
        `https://message-api-yidf.onrender.com/users/search?q=${encodeURIComponent(
          query
        )}`
      );
      setFriendSuggestions(response);
    } catch (err) {
      console.error("Failed to search users:", err);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await secureFetch(
        `https://message-api-yidf.onrender.com/friends/request/${userId}`,
        { method: "POST" }
      );
      setFriendSearch("");
      setFriendSuggestions([]);
      toast.success("Friend request sent");
    } catch (err) {
      console.error("Failed to send friend request:", err);
      toast.error("Could not send friend request");
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      await secureFetch(
        `https://message-api-yidf.onrender.com/friends/${userId}`,
        { method: "DELETE" }
      );
      setFriends((f) => f.filter((p) => p.id !== userId));
      toast.success("Friend removed");
    } catch (err) {
      console.error("Failed to remove friend:", err);
      toast.error("Could not remove friend");
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await secureFetch(
        `https://message-api-yidf.onrender.com/friends/accept/${userId}`,
        { method: "POST" }
      );
      setFriends((f) => [...f, pendingRequests.find((r) => r.id === userId)]);
      setPendingRequests((p) => p.filter((r) => r.id !== userId));
      toast.success("Friend request accepted");
    } catch (err) {
      console.error("Failed to accept friend request:", err);
      toast.error("Could not accept request");
    }
  };

  const handleDenyRequest = async (userId) => {
    try {
      await secureFetch(
        `https://message-api-yidf.onrender.com/friends/deny/${userId}`,
        { method: "POST" }
      );
      setPendingRequests((p) => p.filter((r) => r.id !== userId));
      toast("Request denied", { icon: "❌" });
    } catch (err) {
      console.error("Failed to deny friend request:", err);
      toast.error("Could not deny request");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.username || "Friend"} 👋
        </h1>
        <p className="text-gray-600">
          Here’s what’s happening in your inbox:
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/messages/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Compose Message
        </button>
        <button
          onClick={() => navigate("/messages")}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          View All Messages
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Recent Conversations</h2>
        {recentMessages.length > 0 ? (
          <ul className="space-y-2">
            {recentMessages.map((msg) => (
              <li
                key={msg.id}
                className={`border rounded p-3 cursor-pointer hover:bg-gray-50 transition ${
                  msg.read ? "bg-gray-100" : "bg-white"
                }`}
                onClick={() => navigate(`/messages/${msg.id}`)}
              >
                <p className="font-semibold">
                  {msg.sender?.email || "Unknown sender"}
                </p>
                <div
                  className="text-gray-700 text-sm prose max-w-none"
                  onClick={(e) => e.stopPropagation()}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(msg.content)
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No messages yet. Start a conversation!</p>
        )}
      </div>

      {/* Friends and requests sections unchanged below... */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Your Friends
        </h2>
        {friends.length === 0 ? (
          <p className="text-gray-600">No friends yet.</p>
        ) : (
          <ul className="space-y-3">
            {friends.map((friend) => (
              <li
                key={friend.id}
                className="flex justify-between items-center p-3 bg-white rounded shadow"
              >
                <div>
                  <p className="text-lg font-medium">@{friend.username}</p>
                  <p className="text-sm text-gray-600">{friend.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/profile/${friend.id}`)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder="Search users to add"
          value={friendSearch}
          onChange={(e) => {
            setFriendSearch(e.target.value);
            searchFriends(e.target.value);
          }}
          className="w-full border px-3 py-2 rounded mb-2"
        />
        {friendSuggestions.length > 0 && (
          <ul className="border rounded bg-white shadow">
            {friendSuggestions.map((u) => (
              <li
                key={u.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleAddFriend(u.id)}
              >
                {u.name} ({u.email})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">
          Pending Friend Requests
        </h2>
        <ul className="space-y-2">
          {pendingRequests.map((req) => (
            <li
              key={req.id}
              className="flex justify-between items-center border rounded p-3"
            >
              <span>
                {req.name} ({req.email})
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => handleAcceptRequest(req.id)}
                  className="text-sm text-green-600 hover:underline"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDenyRequest(req.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Deny
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;