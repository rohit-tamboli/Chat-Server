import { useState, useEffect } from "react";
import axios from "axios";

function CommentSection({
  postId,
  currentUserName,
  initialComments = [],
  apiBase, // ✅ correct prop
}) {
  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  const toggleOpen = () => {
    setOpen((o) => !o);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      console.log("📡 Posting comment to:", `${apiBase}/posts/${postId}/comments`);

      const res = await axios.post(
        `${apiBase}/posts/${postId}/comments`,
        {
          userName: currentUserName || "Guest",
          text: commentText.trim(),
        }
      );

      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } catch (err) {
      console.error("❌ Comment error:", err.response?.data || err.message);
      alert("Comment bhejte waqt error aaya");
    }
  };

  return (
    <div className="comments-wrapper">
      <button type="button" onClick={toggleOpen}>
        {open ? "Hide comments" : `Show comments (${comments.length})`}
      </button>

      {open && (
        <>
          {comments.map((c, i) => (
            <div key={i}>
              <strong>{c.userName}</strong>
              <p>{c.text}</p>
            </div>
          ))}

          <form onSubmit={handleAddComment}>
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
            />
            <button type="submit">Post</button>
          </form>
        </>
      )}
    </div>
  );
}

export default CommentSection;
