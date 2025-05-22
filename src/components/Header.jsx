import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Header = ({user}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null); //reference to dropdown area

    const handleLogout = () => {
        //Add logout logic here
        console.log("User Logged out");
    };

    const toggleMenu = () => setMenuOpen(prev => !prev);
    const avatarSrc = user?.avatarUrl || "../assets/default-avatar.png";

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)){
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside); 
    })

  return (
    <header
      className="fixed top-0 left-0 z-50 w-full text-white py-3 px-6 flex items-center justify-between"
      style={{ backgroundColor: "red" }}
    >
      {/* Avatar & Dropdown */}
      <div className="relative" ref={menuRef}>
        <button onClick={toggleMenu} className="flex items-center focus:outline-none">
          <img
            src={avatarSrc}
            alt="User Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        </button>

        {menuOpen && (
          <div className="absolute mt-2 w-40 bg-white text-black rounded shadow-md z-50">
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

      {/* Navigation */}
      <nav className="flex gap-8 text-lg font-semibold">
        <Link to="/">Home</Link>
        <Link to="/messages">Messages</Link>
      </nav>
    </header>
  );
};

export default Header;