import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Folder, Star, GitCommit, Bug, Terminal,
  Lock, Globe, Pencil, Trash2, FileCode, X
} from "lucide-react";
import Navbar from "../Navbar";
import api from "../../axiosConfig";

export default function RepoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // { name, content }
  const [fileLoading, setFileLoading] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => { fetchRepo(); fetchCommits(); fetchFiles(); }, [id]);

  const fetchRepo = async () => {
    try {
      const res = await api.get(`/repo/${id}`);
      const repoData = res.data[0];
      setRepo(repoData);
      const userRes = await api.get(`/userProfile/${userId}`);
      const starred = userRes.data.starRepos?.map(s => s.toString()) || [];
      setIsStarred(starred.includes(id));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCommits = async () => {
    try {
      const res = await api.get(`/commits/${id}`);
      setCommits(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchFiles = async () => {
    try {
      const res = await api.get(`/repo/${id}/files`);
      setFiles(res.data.files || []);
    } catch (err) { console.error(err); }
  };

  const handleFileClick = async (s3Key) => {
    try {
      setFileLoading(true);
      setSelectedFile({ name: s3Key.split("/").pop(), content: null });
      const res = await api.get(`/repo/${id}/file`, { params: { key: s3Key } });
      setSelectedFile({ name: s3Key.split("/").pop(), content: res.data.content });
    } catch (err) { console.error(err); }
    finally { setFileLoading(false); }
  };

  const handleStar = async () => {
    try {
      await api.patch(`/star/${id}`);
      setIsStarred(prev => {
        setRepo(r => ({ ...r, stars: prev ? r.stars - 1 : r.stars + 1 }));
        return !prev;
      });
    } catch (err) { console.error(err); }
  };

  const handleToggleVisibility = async () => {
    try {
      await api.patch(`/repo/toggle/${id}`);
      setRepo(prev => ({ ...prev, visibility: !prev.visibility }));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this repository?")) return;
    try {
      await api.delete(`/repo/delete/${id}`);
      navigate("/");
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="bg-[#0d1117] min-h-screen text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[#8b949e]">Loading repository…</span>
      </div>
    </div>
  );

  if (!repo) return (
    <div className="bg-[#0d1117] min-h-screen text-white flex items-center justify-center">
      <p className="text-[#8b949e]">Repository not found.</p>
    </div>
  );

  const isOwner = repo.owner?._id === userId || repo.owner === userId;
  const cliCmds = [
    `node index.js init ${repo.owner?.username} ${repo.name}`,
    `node index.js add <file>`,
    `node index.js commit "message"`,
    `node index.js push`,
  ];

  return (
    <div className="bg-[#0d1117] min-h-screen text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-5">

        {/* ── HEADER ── */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 shrink-0 w-9 h-9 rounded-lg bg-[#21262d] flex items-center justify-center">
                <Folder size={18} className="text-[#58a6ff]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-white truncate">{repo.name}</h1>
                <p className="text-sm text-[#8b949e] mt-0.5">
                  by <span className="text-[#58a6ff]">{repo.owner?.username || "unknown"}</span>
                </p>
                {repo.description && (
                  <p className="text-sm text-[#8b949e] mt-2 leading-relaxed">{repo.description}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleStar}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[#30363d] rounded-lg bg-[#21262d] hover:bg-[#2d333b] hover:border-[#58a6ff] transition-all"
            >
              <Star size={14} className={isStarred ? "fill-yellow-400 text-yellow-400" : "text-[#8b949e]"} />
              <span className={isStarred ? "text-yellow-400" : "text-[#8b949e]"}>{repo.stars || 0}</span>
            </button>
          </div>
        </div>

        {/* ── OWNER ACTIONS ── */}
        {isOwner && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(`/repo/edit/${id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-[#21262d] hover:bg-[#2d333b] border border-[#30363d] transition-all text-white"
            >
              <Pencil size={13} /> Edit
            </button>
            <button
              onClick={handleToggleVisibility}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-[#21262d] hover:bg-[#2d333b] border border-[#30363d] transition-all text-white"
            >
              {repo.visibility ? <Lock size={13} className="text-orange-400" /> : <Globe size={13} className="text-green-400" />}
              {repo.visibility ? "Make Public" : "Make Private"}
            </button>
            <button
              onClick={handleDelete}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/30 text-red-400 transition-all"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}

        {/* ── FILES ── */}
        <Section icon={<FileCode size={15} className="text-[#58a6ff]" />} title="Files" count={files.length}>
          {files.length === 0
            ? <Empty text="No files pushed yet. Use the CLI to push files." />
            : files.map(f => (
              <div
                key={f.s3Key}
                onClick={() => handleFileClick(f.s3Key)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-[#21262d] cursor-pointer transition-colors group"
              >
                <FileCode size={14} className="text-[#8b949e] shrink-0" />
                <span className="text-sm text-[#58a6ff] group-hover:underline font-mono">{f.name}</span>
              </div>
            ))
          }
        </Section>

        {/* ── CLI ── */}
        <Section icon={<Terminal size={15} className="text-[#58a6ff]" />} title="CLI Setup">
          <div className="space-y-2">
            {cliCmds.map((cmd, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#0d1117] rounded-lg px-4 py-2.5 font-mono text-sm text-[#c9d1d9] border border-[#21262d]">
                <span className="text-[#58a6ff] select-none">$</span>
                <span className="truncate">{cmd}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── COMMITS ── */}
        <Section icon={<GitCommit size={15} className="text-[#58a6ff]" />} title="Commits" count={commits.length}>
          {commits.length === 0
            ? <Empty text="No commits yet" />
            : commits.map(c => (
              <RowItem
                key={c._id}
                primary={c.message}
                secondary={`${c.filesChanged?.length || 0} file${c.filesChanged?.length !== 1 ? "s" : ""} changed`}
                right={new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              />
            ))
          }
        </Section>

        {/* ── ISSUES ── */}
        <Section icon={<Bug size={15} className="text-[#58a6ff]" />} title="Issues" count={repo.issues?.length || 0}>
          {!repo.issues?.length
            ? <Empty text="No issues reported" />
            : repo.issues.map(issue => (
              <RowItem
                key={issue._id}
                primary={issue.title}
                right={
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    issue.status === "open"
                      ? "bg-green-500/15 text-green-400"
                      : "bg-purple-500/15 text-purple-400"
                  }`}>
                    {issue.status}
                  </span>
                }
              />
            ))
          }
        </Section>

      </div>

      {/* ── FILE VIEWER MODAL ── */}
      {selectedFile && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#30363d] shrink-0">
              <div className="flex items-center gap-2">
                <FileCode size={15} className="text-[#8b949e]" />
                <span className="text-sm font-medium text-white font-mono">{selectedFile.name}</span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-auto flex-1">
              {fileLoading ? (
                <div className="flex items-center justify-center h-40 gap-3">
                  <div className="w-4 h-4 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-[#8b949e]">Loading file…</span>
                </div>
              ) : (
                <pre className="p-5 text-sm text-[#c9d1d9] font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {selectedFile.content}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, count, children }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#30363d]">
        {icon}
        <span className="text-sm font-medium text-white">{title}</span>
        {count !== undefined && (
          <span className="ml-1 text-xs bg-[#21262d] text-[#8b949e] border border-[#30363d] rounded-full px-2 py-0.5">{count}</span>
        )}
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}

function RowItem({ primary, secondary, right }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2.5 rounded-lg hover:bg-[#21262d] transition-colors">
      <div className="min-w-0">
        <p className="text-sm text-[#c9d1d9] truncate">{primary}</p>
        {secondary && <p className="text-xs text-[#8b949e] mt-0.5">{secondary}</p>}
      </div>
      {right && <div className="shrink-0 text-xs text-[#8b949e]">{right}</div>}
    </div>
  );
}

function Empty({ text }) {
  return (
    <p className="text-sm text-[#8b949e] text-center py-4">{text}</p>
  );
}