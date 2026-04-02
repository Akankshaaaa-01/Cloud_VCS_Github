 import { Link } from "react-router-dom";
import logo from "../assets/image1.png";
 const Navbar=()=>{
    return <nav className=" flex justify-between px-6 py-3 bg-[#161b22]/95 text-white shadow-md">
        <Link to={"/"} className="flex items-center gap-2 ">
         
            <img src={logo} alt="Logo"className="w-8 h-8" />
            <h3 className="text-lg font-semibold">GitHub</h3>
       
        </Link>

        <div className="flex items-center gap-4">
            <Link to="/create">
            <button className="bg-green-600 px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition">+ New Repo</button>
            </Link>

            <Link to="/profile">
            <button className="px-3 py-1.5 rounded-md text-sm border border-gray-600 hover:bg-gray-900 transition">Profile</button>
            </Link>
        </div>
       
        
    </nav>

 }

 export default Navbar;