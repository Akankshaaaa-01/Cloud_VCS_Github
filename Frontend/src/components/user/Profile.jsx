import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Folder, Star, Users, LogOut, GitCommit
} from "lucide-react";
import Navbar from "../Navbar";
import HeatMapProfile from "./HeatMap";
import api from "../../axiosConfig";

const TABS = [
  { id: "overview",  label: "Overview",      Icon: BookOpen },
  { id: "repos",     label: "Repositories",  Icon: Folder   },
  { id: "starred",   label: "Starred",       Icon: Star     },
];

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState("overview");
  const [userDetails, setUserDetails] = useState(null);
  const [myRepos, setMyRepos]         = useState([]);
  const [starredRepos, setStarredRepos] = useState([]);
  const [followers, setFollowers]     = useState([]);
  const [following, setFollowing]     = useState([]);

  const userId = localStorage.getItem("userId");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [userRes, followRes, repoRes] = await Promise.all([
        api.get(`/userProfile/${userId}`),
        api.get(`/follow/${userId}/data`),
        api.get(`/repo/user/${userId}`),
      ]);

      setUserDetails(userRes.data);
      setFollowers(followRes.data.followers || []);
      setFollowing(followRes.data.following || []);
      setMyRepos(repoRes.data.repositories || []);

      // Starred repos — userDetails mein starRepos array of ids hai
      // Fetch each starred repo
      const starredIds = userRes.data.starRepos || [];
      if (starredIds.length > 0) {
        const allReposRes = await api.get("/repo/all");
        const starred = allReposRes.data.filter(r =>
          starredIds.map(id => id.toString()).includes(r._id.toString())
        );
        setStarredRepos(starred);
      }

    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  if (!userDetails) return (
    <div className="bg-[#0d1117] min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials    = userDetails.username?.slice(0, 2).toUpperCase() || "??";
  const memberSince = new Date(userDetails.createdAt).getFullYear();

  return (
    <div className="bg-[#0d1117] min-h-screen text-white">
      <Navbar />

      {/* ── TABS ── */}
      <div className="border-b border-[#21262d] px-6 flex">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
              activeTab === id
                ? "border-[#f78166] text-[#e6edf3] font-semibold"
                : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            <Icon size={15} />
            {label}
            {id === "repos" && (
              <span className="text-xs bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded-full border border-[#30363d]">
                {myRepos.length}
              </span>
            )}
            {id === "starred" && (
              <span className="text-xs bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded-full border border-[#30363d]">
                {starredRepos.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── LAYOUT ── */}
      <div className="flex gap-8 px-6 py-8 max-w-6xl mx-auto items-start">

        {/* ── SIDEBAR ── */}
        <aside className="w-60 flex-shrink-0 space-y-5">

          {/* Avatar */}
          <div className="w-full aspect-square rounded-full bg-[#161b22] border-2 border-[#30363d] flex items-center justify-center text-5xl font-bold text-[#6e7681] select-none">
            {initials}
          </div>

          {/* Name */}
          <div>
            <h2 className="text-xl font-bold text-[#e6edf3] leading-tight">
              {userDetails.username}
            </h2>
            <p className="text-sm text-[#8b949e] mt-0.5">
              @{userDetails.username?.toLowerCase()}
            </p>
            <p className="text-xs text-[#6e7681] mt-1">
              Member since {memberSince}
            </p>
          </div>

          <hr className="border-[#21262d]" />

          {/* Stats */}
          <div className="flex items-center gap-1.5 text-sm text-[#8b949e]">
            <Users size={14} />
            <span>
              <span className="text-[#c9d1d9] font-semibold">
                {followers.length}
              </span> followers
            </span>
            <span className="text-[#484f58] mx-1">·</span>
            <span>
              <span className="text-[#c9d1d9] font-semibold">
                {following.length}
              </span> following
            </span>
          </div>

          {/* Email */}
          <p className="text-sm text-[#8b949e] break-all">
            {userDetails.email}
          </p>

          <hr className="border-[#21262d]" />

          {/* Edit Profile */}
          <button
            onClick={() => navigate("/edit-profile")}
            className="w-full py-1.5 text-sm border border-[#30363d] rounded-lg hover:bg-[#21262d] transition text-[#c9d1d9]"
          >
            Edit profile
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-1.5 text-sm flex items-center justify-center gap-2 border border-red-900/50 rounded-lg text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={13} />
            Sign out
          </button>

        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 min-w-0 space-y-5">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div className="space-y-5">

              {/* Contribution heatmap */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#e6edf3]">
                    <GitCommit size={15} className="text-[#58a6ff]" />
                    Contribution Activity
                  </div>
                  <span className="text-xs bg-[#21262d] text-[#8b949e] px-3 py-1 rounded-full border border-[#30363d]">
                    Last 12 months
                  </span>
                </div>
                <HeatMapProfile />
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Repositories", value: myRepos.length },
                  { label: "Followers",    value: followers.length },
                  { label: "Following",    value: following.length },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 text-center"
                  >
                    <p className="text-2xl font-bold text-[#e6edf3]">
                      {stat.value}
                    </p>
                    <p className="text-xs text-[#8b949e] mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ── REPOS TAB ── */}
          {activeTab === "repos" && (
            <div className="space-y-3">
              {myRepos.length === 0 ? (
                <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-8 text-center">
                  <Folder size={28} className="text-[#30363d] mx-auto mb-3" />
                  <p className="text-sm text-[#8b949e]">No repositories yet</p>
                  <button
                    onClick={() => navigate("/repo/create")}
                    className="mt-3 px-4 py-1.5 text-sm bg-[#238636] hover:bg-[#2ea043] rounded-lg transition"
                  >
                    Create repository
                  </button>
                </div>
              ) : (
                myRepos.map(repo => (
                  <RepoCard
                    key={repo._id}
                    repo={repo}
                    onClick={() => navigate(`/repo/${repo._id}`)}
                  />
                ))
              )}
            </div>
          )}

          {/* ── STARRED TAB ── */}
          {activeTab === "starred" && (
            <div className="space-y-3">
              {starredRepos.length === 0 ? (
                <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-8 text-center">
                  <Star size={28} className="text-[#30363d] mx-auto mb-3" />
                  <p className="text-sm text-[#8b949e]">
                    No starred repositories yet
                  </p>
                </div>
              ) : (
                starredRepos.map(repo => (
                  <RepoCard
                    key={repo._id}
                    repo={repo}
                    onClick={() => navigate(`/repo/${repo._id}`)}
                    showOwner
                  />
                ))
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

/* ── Shared Repo Card ── */
function RepoCard({ repo, onClick, showOwner = false }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#161b22] border border-[#21262d] hover:border-[#30363d] rounded-xl p-4 cursor-pointer transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <Folder size={14} className="text-[#58a6ff]" />
            <h4 className="text-sm font-semibold text-[#58a6ff] hover:underline">
              {repo.name}
            </h4>
          </div>
          {showOwner && (
            <p className="text-xs text-[#8b949e] mt-0.5 ml-5">
              by {repo.owner?.username || "unknown"}
            </p>
          )}
          {repo.description && (
            <p className="text-xs text-[#8b949e] mt-1.5 ml-5">
              {repo.description}
            </p>
          )}
        </div>

        <span className={`text-xs px-2 py-0.5 rounded-full border ${
          repo.visibility
            ? "text-green-400 border-green-900 bg-green-900/20"
            : "text-red-400 border-red-900 bg-red-900/20"
        }`}>
          {repo.visibility ? "Public" : "Private"}
        </span>
      </div>

      <div className="mt-3 ml-5 flex items-center gap-4 text-xs text-[#8b949e]">
        <span className="flex items-center gap-1">
          <Star size={11} /> {repo.stars || 0}
        </span>
        <span className="flex items-center gap-1">
          <GitCommit size={11} /> {repo.issues?.length || 0} issues
        </span>
      </div>
    </div>
  );
}