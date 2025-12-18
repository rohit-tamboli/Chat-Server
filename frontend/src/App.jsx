// App.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import CommentSection from "./Components/CommentSection";
import "./App.css"; // 👈 ye line add karo


const API_BASE = "http://localhost:5002/api";

function App() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [userName, setUserName] = useState("");
  const [headline, setHeadline] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔍 search ke liye do states:
  const [searchInput, setSearchInput] = useState(""); // input box me jo likh rahe ho
  const [searchQuery, setSearchQuery] = useState(""); // jo actually filter ke liye use hoga

  // user info init
  useEffect(() => {
    const storedName = localStorage.getItem("chatUserName");
    const storedHeadline = localStorage.getItem("chatUserHeadline");

    let name = storedName;
    if (!name) {
      name = prompt("Apna naam likho (public group ke liye):") || "Guest";
      localStorage.setItem("chatUserName", name);
    }

    let title = storedHeadline;
    if (!title) {
      title =
        prompt("Apni headline/role likho (e.g. React Developer):") ||
        "Open to opportunities";
      localStorage.setItem("chatUserHeadline", title);
    }

    setUserName(name);
    setHeadline(title);
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/posts`);
      const data = res.data.map((p) => ({
        ...p,
        likes: p.likes || [], // ensure likes array
      }));
      setPosts(data);
    } catch (err) {
      console.error("❌ Fetch posts error:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    console.log("📩 handlePost called");

    if (!text && !file) {
      alert("Kuch likho ya file attach karo 🙂");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("userName", userName);
      formData.append("headline", headline);
      formData.append("text", text);
      if (file) formData.append("file", file);

      const res = await axios.post(`${API_BASE}/posts`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Post created:", res.data);

      setText("");
      setFile(null);
      e.target.reset?.();

      await fetchPosts();
    } catch (err) {
      console.error("❌ Error in handlePost:", err);
      alert("Post send karte time error aaya. Console check karo.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 check if current user has liked this post
  const hasUserLiked = (post, userName) => {
    if (!post.likes) return false;
    return post.likes.includes(userName);
  };

  // 🔹 like/unlike toggle
  const handleToggleLike = async (postId) => {
    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/like`, {
        userName,
      });

      const { likes } = res.data;

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes, // backend se updated likes array
              }
            : p
        )
      );
    } catch (err) {
      console.error("❌ Like error:", err);
      console.log("Response data:", err.response?.data);
      console.log("Status:", err.response?.status);
      alert("Like karte waqt error aaya. Console check karo.");
    }
  };

  // 🔍 search filtering — sirf searchQuery pe
  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true; // agar query empty hai to sab dikhana
    return (
      post.text?.toLowerCase().includes(q) ||
      post.userName?.toLowerCase().includes(q) ||
      post.headline?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="linkedin-shell">
      {/* NAVBAR */}
      <nav className="nav">
        <div className="nav-left">
          <div className="logo">
            HR<span>Connect</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-user">
            <div className="avatar-circle">
              {userName?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="nav-user-name">{userName}</div>
              <div className="nav-user-headline">{headline}</div>
            </div>
          </div>
        </div>
      </nav>

      {/* GRID LAYOUT */}
      <div className="layout-grid">
        {/* LEFT SIDEBAR */}
        <aside className="sidebar left-sidebar">
          <div className="card profile-card">
            <div className="cover"></div>
            <div className="profile-main">
              <div className="avatar-big">
                {userName?.[0]?.toUpperCase() || "U"}
              </div>
              <h3>{userName}</h3>
              <p className="headline">{headline}</p>
            </div>
            <div className="profile-footer">
              <p>Public group: HR & Job Seekers</p>
              <p className="small-muted">
                Yahan sab log posts, resumes, updates share kar sakte hain.
              </p>
            </div>
          </div>
        </aside>

        {/* CENTER FEED */}
        <main className="feed">
          {/* SEARCH BAR */}
          <div className="card search-card">
            <form
              className="search-form"
              onSubmit={(e) => {
                e.preventDefault();
                setSearchQuery(searchInput.trim());
                console.log("🔍 Searching for:", searchInput.trim());
              }}
            >
              <input
                type="text"
                placeholder="Search posts, names, keywords..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>

          {/* Composer */}
          <div className="card composer-card">
            <form onSubmit={handlePost} className="composer-form">
              <textarea
                placeholder="Share update, drop resume link, ask question..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <div className="composer-actions">
                <label className="file-label">
                  📎 Attach
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                </label>
                <button type="submit" disabled={loading}>
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>

          {/* Posts list */}
          <div className="feed-list">
            {filteredPosts.length === 0 && (
              <p className="no-results">⚠️ No matching posts found.</p>
            )}

            {filteredPosts.map((post) => (
              <article key={post._id} className="card post-card">
                <header className="post-header">
                  <div className="avatar-circle small">
                    {post.userName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="post-name">{post.userName}</div>
                    <div className="post-headline">
                      {post.headline || "Member"}
                    </div>
                    <div className="post-meta">
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleString()
                        : ""}
                    </div>
                  </div>
                </header>

                {post.text && <p className="post-text">{post.text}</p>}

                {post.fileUrl && post.fileType === "image" && (
                  <img
                    src={`http://localhost:5002${post.fileUrl}`}
                    alt="attachment"
                    className="post-image"
                  />
                )}

                {post.fileUrl && post.fileType === "pdf" && (
                  <a
                    href={`http://localhost:5002${post.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="post-file"
                  >
                    📄 Open PDF
                  </a>
                )}

                {post.fileUrl &&
                  post.fileType &&
                  post.fileType !== "image" &&
                  post.fileType !== "pdf" && (
                    <a 
                      href={`http://localhost:5002${post.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="post-file"
                    >
                      📁 Download file
                    </a>
                  )}

                <footer className="post-footer">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(post._id)}
                  >
                    {hasUserLiked(post, userName) ? "❤️ Liked" : "❤️ Like"}{" "}
                    {post.likes && post.likes.length > 0
                      ? `(${post.likes.length})`
                      : ""}
                  </button>

                  <CommentSection
                    postId={post._id}
                    currentUserName={userName}
                    initialComments={post.comments || []}
                    apiBase={API_BASE}
                  />
                </footer>
              </article>
            ))}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="sidebar right-sidebar">
          <div className="card info-card">
            <h4>Group Guidelines</h4>
            <ul>
              <li>No spam / abuse.</li>
              <li>Only HR / jobs / learning related.</li>
              <li>Respect everyone.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
