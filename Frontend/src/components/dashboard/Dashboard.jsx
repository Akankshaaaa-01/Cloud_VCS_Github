import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import api from '../../axiosConfig';

export default function Dashboard() {
  const navigate = useNavigate();

  // States
  const [myRepos, setMyRepos] = useState([]);
  const [allRepos, setAllRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [starredRepos, setStarredRepos] = useState([]);

  const userId = localStorage.getItem("userId");

  // Sab data fetch karo
  useEffect(() => {
    fetchCurrentUser();
    fetchMyRepos();
    fetchAllRepos();
    fetchAllUsers();
  }, []);

  // 1. Apni profile fetch karo
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get(`/userProfile/${userId}`);
      setCurrentUser(res.data);
      // Starred repos aur following list save karo
      setStarredRepos(res.data.starRepos || []);
      setFollowingList(res.data.followedUsers || []);
    } catch (err) {
      console.error("Error fetching user", err);
    }
  };

  // 2. Apni repos fetch karo (left sidebar ke liye)
  const fetchMyRepos = async () => {
    try {
      const res = await api.get(`/repo/user/${userId}`);
      setMyRepos(res.data.repositories || []);
    } catch (err) {
      console.error("Error fetching my repos", err);
    }
  };

  // 3. Saari public repos fetch karo (center ke liye)
  const fetchAllRepos = async () => {
    try {
      const res = await api.get('/repo/all');
      setAllRepos(res.data || []);
    } catch (err) {
      console.error("Error fetching all repos", err);
    }
  };

  // 4. Saare users fetch karo (right sidebar ke liye)
  const fetchAllUsers = async () => {
    try {
      const res = await api.get('/allUsers');
      // Apne aap ko list se hatao
      setAllUsers(res.data.filter(u => u._id !== userId));
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  // Star toggle
  const handleStar = async (repoId) => {
    try {
      await api.patch(`/star/${repoId}`);
      // Locally update karo — page reload nahi hoga
      setStarredRepos(prev =>
        prev.includes(repoId)
          ? prev.filter(id => id !== repoId) // unstar
          : [...prev, repoId]                // star
      );
      // Star count update karo
      setAllRepos(prev => prev.map(repo =>
        repo._id === repoId
          ? { ...repo, stars: starredRepos.includes(repoId) ? repo.stars - 1 : repo.stars + 1 }
          : repo
      ));
    } catch (err) {
      console.error("Error starring repo", err);
    }
  };

  // Follow toggle
  const handleFollow = async (targetUserId) => {
    try {
      await api.patch(`/follow/${targetUserId}`);
      // Locally update karo
      setFollowingList(prev =>
        prev.includes(targetUserId)
          ? prev.filter(id => id !== targetUserId)
          : [...prev, targetUserId]
      );
    } catch (err) {
      console.error("Error following user", err);
    }
  };

  // Search filter — center repos pe
  const filteredRepos = allRepos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

 return (
  <>
    <Navbar />

    <div className="flex gap-6 p-6 bg-[#0d1117] min-h-screen text-white">

      {/* LEFT SIDEBAR */}
      <aside className="w-1/4 space-y-5">

        {/* Profile Card */}
        <div className="bg-[#161b22] rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-lg font-bold">
              {currentUser?.username?.[0]?.toUpperCase() || "U"}
            </div>

            <div>
              <p className="font-semibold">{currentUser?.username}</p>
              <p className="text-xs text-gray-400">{currentUser?.email}</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/repo/create")}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm font-medium transition"
          >
            + New Repository
          </button>
        </div>

        {/* My Repos */}
        <div className="bg-[#161b22] rounded-xl p-4 shadow-md">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            Your Repositories
          </h3>

          {myRepos.map(repo => (
            <div
              key={repo._id}
              onClick={() => navigate(`/repo/${repo._id}`)}
              className="p-2 rounded-md hover:bg-[#21262d] cursor-pointer transition"
            >
              <p className="text-sm text-emerald-400 font-medium">
                {repo.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {repo.description}
              </p>
            </div>
          ))}
        </div>

      </aside>

      {/* CENTER */}
      <main className="w-2/4 space-y-5">

        <h2 className="text-lg font-semibold text-gray-300">
          Explore Repositories
        </h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-sm focus:outline-none focus:border-emerald-500"
        />

        {/* Repo Cards */}
        {filteredRepos.map(repo => (
          <div
            key={repo._id}
            className="bg-[#161b22] rounded-xl p-4 shadow-md hover:shadow-lg hover:scale-[1.01] transition"
          >
            <div className="flex justify-between items-start">

              <div onClick={() => navigate(`/repo/${repo._id}`)}>
                <h4 className="font-semibold text-[#e6edf3] hover:text-blue-400 transition cursor-pointer">
                  {repo.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  by {repo.owner?.username}
                </p>
              </div>

              {/* Star */}
              <button
                onClick={() => handleStar(repo._id)}
                className={`px-3 py-1 rounded-md text-xs border transition ${
                  starredRepos.includes(repo._id)
                    ? "bg-yellow-400/20 text-yellow-300 border-yellow-400"
                    : "border-[#30363d] hover:bg-[#21262d]"
                }`}
              >
                ⭐ {repo.stars || 0}
              </button>
            </div>

            <p className="text-sm text-gray-400 mt-3">
              {repo.description}
            </p>

            <div className="mt-3">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  repo.visibility
                    ? "bg-green-900 text-green-400"
                    : "bg-red-900 text-red-400"
                }`}
              >
                {repo.visibility ? "Public" : "Private"}
              </span>
            </div>
          </div>
        ))}

      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="w-1/4 space-y-5">

        <div className="bg-[#161b22] rounded-xl p-4 shadow-md">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            Who to follow
          </h3>

          {allUsers.slice(0, 5).map(user => (
            <div
              key={user._id}
              className="flex items-center justify-between mb-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <p className="text-sm">{user.username}</p>
              </div>

              <button
                onClick={() => handleFollow(user._id)}
                className={`text-xs px-3 py-1 rounded-md border transition ${
                  followingList.includes(user._id)
                    ? "bg-[#21262d] text-gray-400 border-[#30363d]"
                    : "border-emerald-500 text-emerald-400 hover:bg-emerald-600 hover:text-white"
                }`}
              >
                {followingList.includes(user._id)
                  ? "Following"
                  : "Follow"}
              </button>
            </div>
          ))}
        </div>

      </aside>

    </div>
  </>
);
}