import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogPostService } from '../services/api';
import './BlogPostManager.css';

const BlogPostManager = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await blogPostService.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const createPost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      const data = await blogPostService.createPost({ title: newTitle, content: newContent });
      setPosts([...posts, data]);
      setNewTitle('');
      setNewContent('');
      navigate(`/home`);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  

  return (
    <div className="blog-post-manager">
      <h2>Let's Write Your Blog</h2>
      <div className="create-post">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter the title of your blog"
          className="title-input"
        />
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Write your blog content here..."
          className="content-textarea"
        />
        <button onClick={createPost} className="post-button">Post</button>
      </div>

   </div>
  );
};

export default BlogPostManager;