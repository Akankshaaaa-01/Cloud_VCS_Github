import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Lock, FolderPlus, AlertCircle } from "lucide-react";
import Navbar from "../Navbar";
import api from "../../axiosConfig";

export default function CreateRepo() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Repository name is required"); return; }
    try {
      setLoading(true);
      const res = await api.post("/repo/create", { name, description, visibility: isPublic });
      navigate(`/repo/${res.data.repositoryID}`);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0d1117] min-h-screen text-white">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">

        {/* Page title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-center shrink-0">
            <FolderPlus size={17} className="text-[#58a6ff]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold leading-tight">Create a new repository</h2>
            <p className="text-xs text-[#8b949e] mt-0.5">All your project files and history in one place.</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">

          {/* Name */}
          <Field label="Repository name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-awesome-project"
              className="input"
            />
          </Field>

          {/* Description */}
          <Field label="Description" hint="optional">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              className="input"
            />
          </Field>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <VisibilityCard
                active={isPublic}
                onClick={() => setIsPublic(true)}
                icon={<Globe size={16} className="text-green-400" />}
                title="Public"
                desc="Anyone can see this"
              />
              <VisibilityCard
                active={!isPublic}
                onClick={() => setIsPublic(false)}
                icon={<Lock size={16} className="text-orange-400" />}
                title="Private"
                desc="Only you can see this"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-sm text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Creating…" : "Create Repository"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-5 py-2.5 border border-[#30363d] hover:bg-[#21262d] rounded-lg text-sm text-[#c9d1d9] transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border-radius: 0.5rem;
          background: #161b22;
          border: 1px solid #30363d;
          color: #c9d1d9;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input::placeholder { color: #484f58; }
        .input:focus { border-color: #58a6ff; }
      `}</style>
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-[#c9d1d9] mb-1.5">
        {label}
        {required && <span className="text-red-400">*</span>}
        {hint && <span className="text-[#8b949e] font-normal text-xs">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function VisibilityCard({ active, onClick, icon, title, desc }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
        active
          ? "border-[#58a6ff] bg-[#58a6ff]/8"
          : "border-[#30363d] hover:border-[#8b949e] bg-[#161b22]"
      }`}
    >
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-medium text-[#c9d1d9] leading-tight">{title}</p>
        <p className="text-xs text-[#8b949e] mt-0.5">{desc}</p>
      </div>
      <div className={`ml-auto mt-0.5 w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-all ${
        active ? "border-[#58a6ff] bg-[#58a6ff]" : "border-[#484f58]"
      }`} />
    </div>
  );
}