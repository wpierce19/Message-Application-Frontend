import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {secureFetch} from "./utils/secureFetch";
import defaultAvatar from "../assets/default-avatar.png";

const Messages = () => {
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [thread, setThread] = useState([]);
  const [newReply, setNewReply] = useState("");
  const scrollRef = useRef(null);

   const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    secureFetch(`https://message-api-yidf.onrender.com/messages/${id}`)
      .then((data) => {
        setMessage(data.message);
        setThread(data.thread); // now used as extra comments
      })
      .catch((err) => console.error("Failed to load message:", err));
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread]);

  const handleSendReply = async () => {
    if (!newReply.trim()) return;

    try {
      const response = await secureFetch(
        `https://message-api-yidf.onrender.com/messages/${id}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newReply }),
        }
      );

      setThread((prev) => [...prev, response]);
      setNewReply("");
    } catch (err) {
      console.error("Error sending reply:", err);
    }
  };

  const handleReact = async (emoji, commentId) => {
    try {
      const res = await secureFetch(
        `https://message-api-yidf.onrender.com/messages/${id}/react/${commentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji }),
        }
      );

      // Update local comment to reflect the new reaction
      setMessage((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c.id === commentId
            ? { ...c, reaction: res }
            : c
        ),
      }));
    } catch (err) {
      console.error("Failed to react to message:", err);
    }
  };

  if (!message) return <p className="text-center mt-10">Loading message...</p>;

  // Combine all comments
  const allComments = [...message.comments, ...thread];

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow h-[90vh] flex flex-col">
      {/* Subject/Header */}
      <div className="shrink-0">
        <h2 className="text-2xl font-bold mb-4">Subject</h2>

        <div className="flex items-center gap-4 mb-2">
          <img
            src={
              message.sender?.avatarUrl
                ? `https://message-api-yidf.onrender.com${message.sender.avatarUrl}`
                : defaultAvatar
            }
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-gray-700 font-medium">@{message.sender?.username}</span>
          <span className="text-gray-500 text-sm">{message.sender?.email}</span>
        </div>

        <div className="text-gray-800 border p-4 rounded">{message.content}</div>

        {message.reactions?.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {message.reactions.map((r, i) => (
              <span key={i} className="inline-block mr-2">
                {r.emoji} from @{r.user.username}
              </span>
            ))}
          </div>
        )}

        <hr className="my-4" />
        <h3 className="text-lg font-semibold mb-2">Replies:</h3>
      </div>

      {/* Comments - scrollable, grows with content */}
      <div className="overflow-y-auto flex-1 space-y-2 pr-1" ref={scrollRef}>
        {allComments.map((c) => (
          <div key={c.id} className="border p-2 rounded bg-gray-50">
            <p className="text-sm text-gray-700 font-medium">@{c.sender?.username}</p>
            <p>{c.content}</p>
            <div className="flex justify-between items-center mt-1">
              {c.reaction ? (
                <span className="text-sm text-red-600">
                  ❤️ from @{c.reaction.user.username}
                </span>
              ) : (
                  currentUserId !== c.sender?.id && (
                    <button
                      onClick={() => handleReact("❤️", c.id)}
                      className="text-red-500 text-sm"
                    >
                      ❤️ React
                    </button>
                  )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comment input */}
      <div className="shrink-0 mt-4">
        <textarea
          className="w-full border p-2 rounded"
          rows="3"
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          placeholder="Write a reply..."
        />
        <button
          onClick={handleSendReply}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send Reply
        </button>
      </div>
    </div>
  );
};

export default Messages;
