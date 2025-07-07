# 🖥️ Dash Messaging App — Frontend

This is the **frontend** for the Dash Messaging App built with **React**, **React Router**, **Tailwind CSS**, and **Quill.js**. Users can send rich-text messages, embed images, comment on threads, and interact with a clean UI.

---

## 🚀 Features

- 🧑‍💼 User authentication via JWT
- 📝 Rich-text editor with **Quill**
- 🖼️ Image uploads via Quill toolbar (Multer backend)
- 💬 Threaded messaging with real-time reactions
- 💟 Emoji reactions per user per comment/message
- 🧼 Safe HTML rendering with **DOMPurify**
- 🌗 Light/dark mode ready (optional toggle)
- 🔍 User search with live suggestions

---

## 🖥️ Live Demo

- [Live Preview](https://message-application-frontend.pages.dev)

## 🛠️ Tech Stack

- **React**
- **Tailwind CSS**
- **React Router DOM**
- **Quill 2**
- **DOMPurify**
- **Custom secureFetch wrapper**
- **Deployed with Cloudflare Pages**

---

## 📦 Installation

1. **Clone the repository**:

```bash
git clone https://github.com/yourusername/message-frontend.git
cd message-frontend
```

 2. **Install Dependencies**
 ```bash
 npm install
 ```

 ## 🧪 Development
 To start the frontend development server:
 ```bash
 npm run dev
 ```
 The app will be available at `http://localhost:5173`.

 ## 🔐 Environment Variables
 Create a .env file
 ```bash
 VITE_API_BASE_URL=https://message-api-yidf.onrender.com
 ```
 Update `secureFetch.js` accordingly to reference `import.meta.env.VITE_API_BASE_URL`.

 ## ✨ Rich Text Editor (Quill)

 - **Custom toolbar for headers, lists, code, images, etc.**
- **Image uploads go through /messages/image on the backend**
- **HTML is sanitized before sending and rendering using** `DOMPurify`

---

## 🧼 Security

 - **User content is sanitized via** `DOMPurify` **before being submitted or rendered**
- **FIle uploads only accepts images**
- **JWT is stored securely and attached via** `secureFetch`

## 🧑‍🎨 Future Ideas

 - **Introduce a Light & Dark Mode**

 ## Contact Info

 **Wyatt Pierce @ wpierce53@gmail.com**
