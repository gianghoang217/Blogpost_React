import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogPostService } from '../services/api';
import './EditPost.css'; // Import the CSS file

const EditPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({
    title: '',
    content: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await blogPostService.getPostById(postId);
        setPost({ title: data.title, content: data.content });
      } catch (err) {
        setError('Error fetching post details');
        console.error(err);
      }
    };

    fetchPost();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await blogPostService.updatePost(postId, { title: post.title, content: post.content });
      navigate(`/home`);
    } catch (err) {
      setError('Error updating post');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost((prevPost) => ({
      ...prevPost,
      [name]: value,
    }));
  };

  return (
    <div className="edit-post">
      <h2>Edit Post</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            id="title"
            name="title"
            value={post.title}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <textarea
            id="content"
            name="content"
            value={post.content}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit">Update Post</button>
      </form>
    </div>
  );
};

export default EditPost;
