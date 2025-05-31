//Will be the main hub for anything messages
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { secureFetch } from "./utils/secureFetch.js";
import { MDXEditor } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

const Messages = ({user}) => {
    const { id } = useParams();
    const [message, setMessage] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [thread, setThread] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    useEffect(() => {
        secureFetch(`/api/messages/${id}`)
        .then((data) => {
            setMessage(data.message);
            setThread(data.thread);
        })
        .catch((err) => console.error("Failed to fetch message thread:", err));
    }, [id]);

    const handleSend = async () => {
        if (!newComment.trim()) return;
        try {
            const response = await secureFetch(`/api/message/${id}/reply`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({content: newComment}),
            });
            setThread([...thread, response]);
            setNewComment("");
        } catch (err) {
            console.error("Error sending reply:", err);
        }
    };

    const handleEdit = async (msgId) => {
        try {
            const response = await secureFetch(`/api/messages/${id}/edit/${msgId}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({content: editingText}),
            });
            setThread(thread.map((msg) => (msg.id === msgId ? response : msg)));
            setEditingId(null);
            setEditingText("");
        } catch (err) {
            console.error("Failed to edit message:", err);
        }
    };

    const handleDelete = async (msgId) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            await secureFetch(`/api/messages/${id}/delete/${msgId}`, {
                method: "DELETE"
            });
            setThread(thread.filter((msg) => msg.id !== msgId));
        } catch (err) {
            console.error("Failed to delete message:", err);
        }
    };

    const handleReact = async (msgId, emoji) => {
        try {
            const updated = await secureFetch(`/api/messages/${id}/react/${msgId}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({emoji}),
            });
            setThread(thread.map((msg) => (msg.id === msgId ? updated : msg)));
        } catch (err) {
            console.error("Failed to react to message:", err);
        }
    };

  return message ? (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-xl font-bold mb-4">Subject: {message.subject}</h2>
      <div className="space-y-4">
        {thread.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded border relative ${
              msg.senderId === user?.id ? "bg-blue-50" : "bg-gray-50"
            }`}
          >
            <p className="text-sm text-gray-600">
              From: {msg.sender?.email} • {new Date(msg.createdAt).toLocaleString()}
            </p>
            {editingId === msg.id ? (
              <div>
                <textarea
                  className="w-full border p-2 mt-1"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <button
                  onClick={() => handleEdit(msg.id)}
                  className="mt-1 px-3 py-1 bg-green-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-800">{msg.content}</p>
                <div className="mt-1 flex gap-2 text-xl">
                  {["👍", "❤️", "😂", "😮"].map((emoji) => {
                    const count = msg.reactions?.filter((r) => r.emoji === emoji).length || 0;
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleReact(msg.id, emoji)}
                        className="hover:scale-110 transition"
                      >
                        {emoji} {count > 0 && <span className="text-sm ml-1">{count}</span>}
                      </button>
                    );
                  })}
                </div>
                {msg.senderId === user?.id && (
                  <div className="mt-1 space-x-2">
                    <button
                      onClick={() => {
                        setEditingId(msg.id);
                        setEditingText(msg.content);
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <MDXEditor
          markdown={newComment}
          onChange={setNewComment}
          className="border rounded bg-white"
        />
        <button
          onClick={handleSend}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  ) : (
    <p className="text-center mt-10">Loading message...</p>
  );
};

export default Messages;