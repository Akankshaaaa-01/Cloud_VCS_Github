import { Link } from "react-router-dom";
import logo from "../assets/image1.png";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-[#0d1107] border-b border-[#30363d] text-white">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="w-8 h-8" />
          <span className="font-semibold text-lg tracking-wide">DevHub</span>
        </Link>

        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          className="ml-4 px-3 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] text-sm focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Link to="/profile">
          <button className="px-3 py-1.5 text-sm rounded-md border border-[#30363d] hover:bg-[#21262d] transition">
            Profile
          </button>
        </Link>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">
          U
        </div>
      </div>

    </nav>
  );
};

export default Navbar;