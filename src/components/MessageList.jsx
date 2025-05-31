//Will ask the backend to send all messages that the user has created/ participated in
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserMessages, markMessageAsRead } from "./services/messageService.js";

//Help to extract first sentence
const getFirstSentence = (text) => {
    const match = text.match(/(.*?[.!?])(\s|$)/);
    return match ? match[1] : text;
};

const MessageList = () => {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserMessages()
        .then(setMessages)
        .catch((err) => setError("Failed to load messages: " + err.message));
    }, []);

    const handleReadAndRedirect = async (msg) => {
        if (!msg.read){
            try {
                await markMessageAsRead(msg.id);
                setMessages((msgs) => 
                    msgs.map((m) => (m.id === msg.id ? {...m, read: true} : m))
                );
            } catch (err) {
                console.error("Failed to mark as read:", err);
            }
        }

        navigate(`/messages/${msg.id}`);
    };

    return (
        <div className="max-w-3x1 mx-auto mt-10 p-6 bg-white rounded shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text 2x1 font-bold">Your Messages</h2>
                <div className="space-x-2">
                    <button
                        onClick={() => navigate("/messages/new")}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Create Message
                    </button>
                    <button
                        onClick={() => alert("Delete functionality coming soon")}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Delete Message
                    </button>
                </div>
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <ul className="space-y-4">
                {messages.map((msg) => (
                    <li
                        key={msg.id}
                        onClick={() => handleReadAndRedirect(msg)}
                        className={`cursor-pointer border rounded px-4 py-3 transition ${msg.read ? "bg-gray-100" : "bg-white"}`}
                    >
                        <p className="font-semibold text-gray-800">
                            From: {msg.sender?.name || msg.sender?.email || "Unknown Sender"}
                        </p>
                        <p className="text-gray-700">{getFirstSentence(msg.content)}</p>

                        {!msg.read && (
                            <span className="inline-block mt-2 text=xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                New
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MessageList;