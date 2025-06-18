import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import defaultAvatar from "../assets/default-avatar.png";

const Header = ({ user, setUser, setToken }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    console.log("User Logged out");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Debug user info
  useEffect(() => {
    console.log("Header user object:", user);
  }, [user]);

  // ✅ Safe avatar fallback
  const avatarSrc = user?.avatarUrl
    ? user.avatarUrl.startsWith("http")
      ? user.avatarUrl
      : `https://message-api-yidf.onrender.com${user.avatarUrl}`
    : defaultAvatar;

  return (
    <header
      className="fixed top-0 left-0 z-50 w-full text-white py-3 px-6 flex items-center justify-end"
      style={{ backgroundColor: "red" }}
    >
      <nav className="flex items-center gap-6 text-lg font-semibold mr-4">
        <Link to="/">Home</Link>
        <Link to="/messages">Messages</Link>
      </nav>

      <div
        className="relative"
        ref={menuRef}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <button className="flex items-center focus:outline-none">
          <img
            src={avatarSrc}
            alt="User Avatar"
            className="w-10 h-10 rounded-full object-cover border border-white"
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-md z-50">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
