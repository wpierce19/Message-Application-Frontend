//Will have the functionality to send new messages to the backend for saving
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { secureFetch } from "./utils/secureFetch";
import { MDXEditor } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

const CreateMessage = () => {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [recipient, setRecipient] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [attachment, setAttachment] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const searchUsers = async (query) => {
        if (!query) return setSuggestions([]);
        try {
            const response = await secureFetch(`/api/users/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSuggestions(data);
        } catch (err) {
            setIsSubmitting(false);
            console.error("User search failed:", err);
        }
    };

const handleSubmit = async () => {
    if (!recipient || !subject || !content) {
      setError("All fields are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("recipient", recipient);
      formData.append("subject", subject);
      formData.append("content", content);
      if (attachment) formData.append("attachment", attachment);

      setIsSubmitting(true);
      await secureFetch("/api/messages", {
        method: "POST",
        body: formData,
      });
      setSuccess(true);
      setTimeout(() => navigate("/messages"), 1000);
      navigate("/messages");
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again later.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create New Message</h2>

      {success && <p className="text-green-600 mb-4">Message sent successfully!</p>}

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <label className="block font-medium mb-1">To:</label>
      <input
        type="text"
        className="w-full border px-3 py-2 rounded mb-2"
        value={recipient}
        onChange={(e) => {
          setRecipient(e.target.value);
          searchUsers(e.target.value);
        }}
        placeholder="Search user by name or email"
      />
      {suggestions.length > 0 && (
        <ul className="border rounded bg-white shadow mb-4">
          {suggestions.map((user) => (
            <li
              key={user.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setRecipient(user.email);
                setSuggestions([]);
              }}
            >
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      )}

      <label className="block font-medium mb-1">Subject:</label>
      <input
        type="text"
        className="w-full border px-3 py-2 rounded mb-4"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <label className="block font-medium mb-1">Message:</label>
      <MDXEditor
        markdown={content}
        onChange={setContent}
        className="border rounded mb-2"
      />
      <div className="text-sm text-gray-600 mb-4">Characters: {content.length}</div>

      <label className="block font-medium mb-1">Attachment:</label>
      <input
        type="file"
        accept=".pdf,image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          const maxSize = 5 * 1024 * 1024; // 5MB

          if (file && !["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"].includes(file.type)) {
            setError("Only PDF and image files are allowed.");
            setAttachment(null);
          } else if (file && file.size > maxSize) {
            setError("File size must be 5MB or less.");
            setAttachment(null);
          } else {
            setError("");
            setAttachment(file);
          }
        }}
        className="mb-4"
      />
      {attachment && (
        <div className="text-sm text-gray-700 mb-2">Selected file: {attachment.name}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Send Message
      </button>
    </div>
  );
};

export default CreateMessage;