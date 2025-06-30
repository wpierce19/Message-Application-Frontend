import { useState, useEffect } from "react";
import { secureFetch } from "./utils/secureFetch";
import { useNavigate } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import DOMPurify from "dompurify";

const CreateMessage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [subject, setSubject] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  if (!editor && !document.querySelector(".ql-toolbar")) {
    const quill = new Quill("#quill-editor", {
      theme: "snow",
      placeholder: "Write your message here...",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"]
        ],
        clipboard: { matchVisual: false }
      }
    });

    quill.getModule('toolbar').addHandler('image', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
          const res = await secureFetch("https://message-api-yidf.onrender.com/messages/image", {
            method: "POST",
            body: formData,
          });

          const range = quill.getSelection();
          quill.insertEmbed(range.index, "image", `https://message-api-yidf.onrender.com${res.url}`);
        } catch (err) {
          console.error("Image upload failed", err);
        }
      };
    });

    setEditor(quill);
  }
}, [editor]);

  const searchUsers = async (query) => {
    if (!query) return setSuggestions([]);
    try {
      const data = await secureFetch(
        `https://message-api-yidf.onrender.com/users/search?q=${encodeURIComponent(query)}`
      );
      setSuggestions(data);
    } catch (err) {
      setIsSubmitting(false);
      console.error("User search failed:", err);
    }
  };

  const handleSubmit = async () => {
    const rawHtml = editor?.root.innerHTML;
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);

    if (!recipient || !subject || sanitizedHtml === "" || sanitizedHtml === "<p><br></p>") {
      setError("All fields are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("recipientId", recipientId);
      formData.append("subject", subject);
      formData.append("content", sanitizedHtml);

      setIsSubmitting(true);
      await secureFetch("https://message-api-yidf.onrender.com/messages", {
        method: "POST",
        body: formData,
      });
      setSuccess(true);
      setTimeout(() => navigate("/messages"), 1000);
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
                setRecipientId(user.id);
                setRecipient(`${user.username} (${user.email})`); // just for display
                setSuggestions([]);
              }}
            >
              {user.username} ({user.email})
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
      <div id="quill-editor" className="bg-white border rounded mb-6 min-h-[150px]" />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Send Message
      </button>
    </div>
  );
};

export default CreateMessage;