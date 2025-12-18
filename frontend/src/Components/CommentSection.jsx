// CommentSection.jsx
import { useState } from "react";
import axios from "axios";

function CommentSection({
  postId,
  currentUserName,
  initialComments = [],
  apiBase,
}) {
  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(initialComments);

  const toggleOpen = () => {
    setOpen((o) => !o);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(`${apiBase}/posts/${postId}/comments`, {
        userName: currentUserName || "Guest",
        text: commentText.trim(),
      });

      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } catch (err) {
      console.error("❌ Comment error:", err);
      alert("Comment bhejte waqt error aaya.");
    }
  };

  return (
    <div className="comments-wrapper">
      <button type="button" className="comments-toggle" onClick={toggleOpen}>
        {open ? `Hide comments` : `Show comments (${comments.length})`}
      </button>

      {open && (
        <div className="comments-block">
          <div className="comments-list">
            {comments.length === 0 && (
              <p className="comments-empty">Be the first to comment 🙂</p>
            )}
            {comments.map((c, idx) => (
              <div key={idx} className="comment-item">
                <div className="comment-header">
                  <strong>{c.userName || "User"}</strong>
                </div>
                <p className="comment-text">{c.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit">Post</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CommentSection;
