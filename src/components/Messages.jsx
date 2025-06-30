import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import { secureFetch } from "./utils/secureFetch";
import defaultAvatar from "../assets/default-avatar.png";

const ALLOWED_TAGS = [
  "h1","h2","h3","p","b","i","u","a","ul","ol","li",
  "blockquote","code","pre","strong","em","span","div","br","img"
];
const ALLOWED_ATTR = ["href","src","alt","title","target","rel"];

const Messages = () => {
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [thread, setThread] = useState([]);
  const scrollRef = useRef(null);
  const quillRef = useRef(null);
  const quillInstanceRef = useRef(null);

  useEffect(() => {
    secureFetch(`https://message-api-yidf.onrender.com/messages/${id}`)
      .then((data) => {
        setMessage(data.message);
        setThread(data.thread);
      })
      .catch((err) => console.error("Failed to load message:", err));
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread]);

  useLayoutEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      if (!quillRef.current || quillInstanceRef.current) return;

      const quill = new Quill(quillRef.current, {
        theme: "snow",
        placeholder: "Write your reply here...",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold","italic","underline"],
            ["blockquote","code-block"],
            [{ list: "ordered" },{ list: "bullet" }],
            ["link","image"],
            ["clean"]
          ]
        }
      });

      // 1. Intercept pasted/dragged images
      quill.clipboard.addMatcher("img", (node) => {
        const imageUrl = node.getAttribute("src");
        return {
          ops: [{
            insert: { image: imageUrl },
            attributes: {
              style:
                "max-width:300px; height:auto; border-radius:6px; display:block; margin:1rem 0;"
            }
          }]
        };
      });

      // style the editor container & content
      const container = quillRef.current.querySelector(".ql-container");
      const editor    = quillRef.current.querySelector(".ql-editor");
      if (container) {
        container.classList.add(
          "border","border-gray-300","rounded","bg-white",
          "min-h-[150px]","overflow-y-auto"
        );
      }
      if (editor) {
        editor.classList.add("p-3");
      }

      // 2. Handle upload button
      quill.getModule("toolbar").addHandler("image", () => {
        const input = document.createElement("input");
        input.setAttribute("type","file");
        input.setAttribute("accept","image/*");
        input.click();

        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;

          // ⛔️ File size check: max 2MB
          const maxSize = 2 * 1024 * 1024;
          if (file.size > maxSize) {
            alert("Image too large. Maximum size is 2 MB.");
            return;
          }

          const formData = new FormData();
          formData.append("image", file);

          try {
            const res = await secureFetch(
              "https://message-api-yidf.onrender.com/messages/image",
              { method: "POST", body: formData }
            );
            const imageUrl = `https://message-api-yidf.onrender.com${res.url}`;
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, "image", imageUrl);
            quill.setSelection(range.index + 1);

            // inline-style the newly inserted image
            setTimeout(() => {
              const editor = quillRef.current.querySelector(".ql-editor");
              const imgs = editor.querySelectorAll("img");
              imgs.forEach((img) => {
                if (img.src === imageUrl) {
                  img.style.maxWidth    = "300px";
                  img.style.height      = "auto";
                  img.style.borderRadius = "6px"; 
                  img.style.display     = "block";
                  img.style.marginTop   = "1rem";
                  img.style.marginBottom= "1rem";
                }
              });
            }, 10);
          } catch (err) {
            console.error("Image upload failed", err);
          }
        };
      });

      quillInstanceRef.current = quill;
    }, 0);

    return () => clearTimeout(timer);
  }, [message]);

  const handleSendReply = async () => {
    const content = DOMPurify.sanitize(
      quillInstanceRef.current?.root.innerHTML || "",
      { ALLOWED_TAGS, ALLOWED_ATTR }
    );
    if (!content || content === "<p><br></p>") return;

    try {
      const response = await secureFetch(
        `https://message-api-yidf.onrender.com/messages/${id}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
        }
      );
      setThread((prev) => [...prev, response]);
      quillInstanceRef.current?.setContents([]);
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
          body: JSON.stringify({ emoji })
        }
      );
      setMessage((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c.id === commentId ? { ...c, reaction: res } : c
        )
      }));
    } catch (err) {
      console.error("Failed to react to message:", err);
    }
  };

  if (!message) {
    return <p className="text-center mt-10">Loading message...</p>;
  }

  const allComments = [...message.comments, ...thread];

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow h-[90vh] flex flex-col">
      {/* Main message */}
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
        <div
          className="text-gray-800 border p-4 rounded prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(message.content, {
              ALLOWED_TAGS, ALLOWED_ATTR
            })
          }}
        />
        <style>{`
          .prose img {
            max-width: 300px;
            height: auto;
            border-radius: 0.375rem;
          }
        `}</style>
        <hr className="my-4" />
        <h3 className="text-lg font-semibold mb-2">Replies:</h3>
      </div>

      {/* Thread of comments */}
      <div className="overflow-y-auto flex-1 space-y-2 pr-1" ref={scrollRef}>
        {allComments.map((c) => (
          <div
            key={c.id}
            className="border p-2 rounded bg-gray-50 max-w-full break-words overflow-hidden"
          >
            <p className="text-sm text-gray-700 font-medium">@{c.sender?.username}</p>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(c.content, {
                  ALLOWED_TAGS, ALLOWED_ATTR
                })
              }}
            />
            <style>{`
              .prose img {
                max-width: 300px;
                height: auto;
                border-radius: 0.375rem;
              }
            `}</style>
            <div className="flex justify-between items-center mt-1">
              {c.reaction ? (
                <span className="text-sm text-red-600">
                  ❤️ from @{c.reaction.user.username}
                </span>
              ) : (
                <button
                  onClick={() => handleReact("❤️", c.id)}
                  className="text-red-500 text-sm"
                >
                  ❤️ React
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply editor */}
      <div className="shrink-0 mt-4 flex flex-col">
        <label className="block font-medium mb-1">Reply:</label>
        <div ref={quillRef} className="mb-2" />
        <button
          onClick={handleSendReply}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send Reply
        </button>
      </div>
    </div>
  );
};

export default Messages;
