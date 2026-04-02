import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import profileImg from "../../assets/image1.png"; // dummy avatar
import Navbar from "../Navbar";
import HeatMapProfile from "./HeatMap";

export default function Profile() {

  const Navigate=useNavigate();
  const [userDetails,setUserDetails] =useState("");

  useEffect(()=>{
    const fetchUserDetails =async()=>{
      const userId= localStorage.getItem("userId");
      if(userId){
        try{
          const response= await axios.get(`http://localhost:3002/userProfile/${userId}`)
          setUserDetails(response.data);
        }catch(err){
          console.error("Cannot fetch user Details")
        }
      }
    };

    fetchUserDetails(); 
  },[])

  return (
    <div className="bg-gray-900 min-h-screen text-white">
        <Navbar/>
      {/* 🔹 COVER IMAGE */}
      <div className="h-32 w-full ">
      </div>

      {/* 🔹 PROFILE SECTION */}
      <div className="max-w-6xl mx-auto px-6">

        {/* profile image + info */}
        <div className="flex items-end gap-6 -mt-12">

          {/* Profile Image */}
          <div className="w-24 h-24 rounded-full border-4 border-gray-900 overflow-hidden">
            <img
              src={profileImg}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* User Info */}
          <div>
            <h2 className="text-2xl font-semibold">{userDetails.username}</h2>
            <p className="text-gray-400 text-sm">
              Full Stack Developer 
            </p>
          </div>

        </div>

        {/* 🔹 ACTION BUTTONS */}
        <div className="mt-4 flex gap-3">
          <button className="px-4 py-1.5 bg-green-600 rounded-md hover:bg-green-700">
            Edit Profile
          </button>
          <button className="px-4 py-1.5 border border-gray-600 rounded-md hover:bg-gray-800">
            Share
          </button>
        </div>

        {/* 🔹 MAIN CONTENT */}
        <div className="mt-8 flex gap-6">

          {/* LEFT SIDEBAR */}
          <aside className="w-1/4 space-y-4">

            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-gray-400">
                Aspiring engineer building cool stuff 
              </p>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Stats</h3>
              <p className="text-sm text-gray-400">Repos: 12</p>
              <p className="text-sm text-gray-400">Followers: 34</p>
            </div>

          </aside>

          {/* CENTER */}
          <main className="w-3/4">

           <div className="bg-slate-800 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-3">
              Contribution Activity
            </h3>
            <HeatMapProfile />
          </div>

            <h3 className="text-lg font-semibold mb-4">
              Your Repositories
            </h3>

            <div className="space-y-3 mb-4">

              {/* dummy repo */}
              <div className="bg-slate-800 p-4 rounded-lg">
                <h4 className="font-medium">Repo Name</h4>
                <p className="text-sm text-gray-400">
                  Description of repo
                </p>
              </div>

              <div className="bg-slate-800 p-4 rounded-lg">
                <h4 className="font-medium">Another Repo</h4>
                <p className="text-sm text-gray-400">
                  Some description here
                </p>
              </div>

            </div>

          </main>

        </div>

      </div>
    </div>
  );
}