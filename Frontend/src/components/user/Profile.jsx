import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import HeatMapProfile from "./HeatMap";
import api from "../../axiosConfig";
import profileImg from "../../assets/image1.png"; 
export default function Profile() {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState(null);
  const [myRepos, setMyRepos] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchUserDetails();
    fetchMyRepos();
    fetchFollowData();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const res = await api.get(`/userProfile/${userId}`);
      setUserDetails(res.data);
    } catch (err) {
      console.error("User fetch error");
    }
  };

  const fetchMyRepos = async () => {
    try {
      const res = await api.get(`/repo/user/${userId}`);
      setMyRepos(res.data.repositories || []);
    } catch (err) {
      console.error("Repo fetch error");
    }
  };

  const fetchFollowData = async () => {
    try {
      const res = await api.get(`/follow/${userId}/data`);
      setFollowers(res.data.followers || []);
      setFollowing(res.data.following || []);
    } catch (err) {
      console.error("Follow fetch error");
    }
  };

  if (!userDetails) return null;

  return (
    <div className="bg-[#0d1117] min-h-screen text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* HEADER */}
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold">
            <img src={profileImg}/>
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              {userDetails.username}
            </h2>

            <p className="text-sm text-gray-400">
              Joined {new Date(userDetails.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => navigate("/edit-profile")}
            className="px-4 py-1.5 bg-emerald-600 rounded-md hover:bg-emerald-700 text-sm transition"
          >
            Edit Profile
          </button>

          <button className="px-4 py-1.5 border border-gray-600 rounded-md hover:bg-gray-800 text-sm transition">
            Share
          </button>
        </div>

        <div className="flex gap-6">

          {/* LEFT */}
          <aside className="w-64 space-y-4">

            <div className="bg-[#1f2937] p-4 rounded-xl">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-gray-400">
                {userDetails.email}
              </p>
            </div>

            <div className="bg-[#1f2937] p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Stats</h3>

              <p className="text-sm text-gray-400">
                Repositories: {myRepos.length}
              </p>
              <p className="text-sm text-gray-400">
                Followers: {followers.length}
              </p>
              <p className="text-sm text-gray-400">
                Following: {following.length}
              </p>
            </div>

          </aside>

          {/* CENTER */}
          <main className="flex-1 space-y-8">

            {/* Heatmap */}
            <div className="bg-[#1f2937] p-5 rounded-xl">
              <h3 className="font-semibold mb-3">
                Contribution Activity
              </h3>
              <HeatMapProfile />
            </div>

            {/* Repositories */}
            <div>
              <h3 className="font-semibold text-lg mb-3">
                Your Repositories ({myRepos.length})
              </h3>

              {myRepos.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No repositories yet
                </p>
              ) : (
                <div className="space-y-3">
                  {myRepos.map((repo) => (
                    <div
                      key={repo._id}
                      onClick={() => navigate(`/repo/${repo._id}`)}
                      className="bg-[#1f2937] p-4 rounded-xl cursor-pointer transition hover:bg-[#273449] hover:shadow-lg hover:scale-[1.01]"
                    >
                      {/* TOP */}
                      <div className="flex justify-between items-start">

                        <div>
                          <h4 className="text-emerald-400 font-medium">
                            {repo.name}
                          </h4>

                          <p className="text-sm text-gray-400 mt-1">
                            {repo.description || "No description"}
                          </p>
                        </div>

                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            repo.visibility
                              ? "bg-emerald-900 text-emerald-400"
                              : "bg-red-900 text-red-400"
                          }`}
                        >
                          {repo.visibility ? "Public" : "Private"}
                        </span>
                      </div>

                      {/* BOTTOM */}
                      <div className="mt-3 flex items-center gap-5 text-xs text-gray-400">
                        <span>⭐ {repo.stars || 0}</span>
                        <span>Issues: {repo.issues?.length || 0}</span>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </main>

        </div>
      </div>
    </div>
  );
}