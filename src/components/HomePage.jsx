import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { blogPostService, authService } from '../services/api';
import './HomePage.css';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    fetchCurrentUser();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await blogPostService.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await blogPostService.likePost(postId);
      // Refresh posts to update like count
      fetchPosts();
    } catch (error) {
      alert(error);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await blogPostService.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="home-page">
      <h2 style={{
    fontFamily: "'Poppins', sans-serif",
    fontSize: "2.2rem",
    fontWeight: "600",
    color: "#2c3e50",
    letterSpacing: "0.5px",
    paddingBottom: "10px",
    borderBottom: "3px solid #3498db",
    marginBottom: "20px"
  }}>Community Feed</h2>
      {posts.length === 0 ? (
        <p>
          No one has posted anything, <Link to="/posts">start to post</Link>!
        </p>
      ) : (
        <div className="posts-container">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <h3 style={{
                  fontSize: "1.3rem",
                  fontWeight: "600",
                  color: "#34495e",
                  marginBottom: "0.5rem",
                  lineHeight: "1.3",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => e.target.style.color = '#3498db'}
                onMouseLeave={(e) => e.target.style.color = '#34495e'}>
                  {post.title}</h3>
                <span className="post-author">By {post.username}</span>
              </div>
              <div className="post-content">
                <p>{post.content}</p>
              </div>
              <div className="post-footer">
                <div className="like-section">
                <button 
                  className={`like-button ${post.is_liked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}>
                  {post.is_liked ? '❤️' : '🤍'}
                </button>
                <span className="like-count">
                {post.likes_count} {post.likes_count === 1 | post.likes_count === 0 ? 'like' : 'likes'}
                </span>
                </div>
                {currentUser && currentUser.id === post.user_id && (
                  <div className="post-actions">
                    
                    <button
                    className="edit-button"
                    onClick={() => navigate(`/posts/edit/${post.id}`)}>Edit
                    </button>
                    
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(post.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;