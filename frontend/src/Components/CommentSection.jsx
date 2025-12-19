import { useState, useEffect } from "react";
import axios from "axios";
import "./CommentSection.css"; 
function CommentSection({
  postId,
  currentUserName,
  initialComments = [],
  apiBase,
}) {
  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
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
      alert("Comment bhejte waqt error aaya");
    }
  };

  return (
    <div className="comments-wrapper">
      <button
        type="button"
        className="comments-toggle"
        onClick={() => setOpen((o) => !o)}
      >
        💬 {open ? "Hide comments" : `Comments (${comments.length})`}
      </button>

      {open && (
        <div className="comments-box">
          {comments.length === 0 && (
            <p className="no-comments">Be the first to comment 🙂</p>
          )}

          {comments.map((c, i) => (
            <div key={i} className="comment-item">
              <div className="comment-avatar">
                {c.userName?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="comment-content">
                <div className="comment-user">{c.userName}</div>
                <div className="comment-text">{c.text}</div>
              </div>
            </div>
          ))}

          <form className="comment-form" onSubmit={handleAddComment}>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
            />
            <button type="submit">Post</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CommentSection;
