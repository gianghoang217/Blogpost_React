import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlogPostManager from '../BlogPostManager';
import { blogPostService } from '../../services/api';

// Mock the router hooks
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
}));

// Mock the blogPostService
jest.mock('../../services/api', () => ({
  blogPostService: {
    getAllPosts: jest.fn(),
    createPost: jest.fn(),
  },
}));

describe('BlogPostManager Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock successful posts fetch with empty array
    blogPostService.getAllPosts.mockResolvedValue([]);
  });

  test('renders BlogPostManager component with form elements', async () => {
    render(<BlogPostManager />);

    // Verify heading is rendered
    expect(screen.getByText("Let's Write Your Blog")).toBeInTheDocument();
    
    // Verify input fields are rendered
    expect(screen.getByPlaceholderText("Enter the title of your blog")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write your blog content here...")).toBeInTheDocument();
    
    // Verify post button is rendered
    expect(screen.getByText("Post")).toBeInTheDocument();
  });

  test('allows user to enter title and content', () => {
    render(<BlogPostManager />);

    // Get input fields
    const titleInput = screen.getByPlaceholderText("Enter the title of your blog");
    const contentTextarea = screen.getByPlaceholderText("Write your blog content here...");

    // Simulate user typing
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentTextarea, { target: { value: 'Test Content' } });

    // Check if the input values were updated
    expect(titleInput).toHaveValue('Test Title');
    expect(contentTextarea).toHaveValue('Test Content');
  });

  test('createPost function is called with correct data when post button is clicked', async () => {
    // Mock successful post creation
    const mockNewPost = {
      id: '1',
      title: 'Test Title',
      content: 'Test Content',
      author: { username: 'testuser' },
    };
    blogPostService.createPost.mockResolvedValue(mockNewPost);

    render(<BlogPostManager />);

    // Get input fields and button
    const titleInput = screen.getByPlaceholderText("Enter the title of your blog");
    const contentTextarea = screen.getByPlaceholderText("Write your blog content here...");
    const postButton = screen.getByText("Post");

    // Simulate user typing
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentTextarea, { target: { value: 'Test Content' } });
    
    // Click the post button
    fireEvent.click(postButton);

    // Verify createPost was called with correct data
    await waitFor(() => {
      expect(blogPostService.createPost).toHaveBeenCalledWith({
        title: 'Test Title',
        content: 'Test Content'
      });
    });
  });

  test('input fields are cleared and navigate is called after successful post creation', async () => {
    // Mock successful post creation
    const mockNewPost = {
      id: '1',
      title: 'Test Title',
      content: 'Test Content',
      author: { username: 'testuser' },
    };
    blogPostService.createPost.mockResolvedValue(mockNewPost);

    render(<BlogPostManager />);

    // Get input fields and button
    const titleInput = screen.getByPlaceholderText("Enter the title of your blog");
    const contentTextarea = screen.getByPlaceholderText("Write your blog content here...");
    const postButton = screen.getByText("Post");

    // Simulate user typing
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentTextarea, { target: { value: 'Test Content' } });
    
    // Click the post button
    fireEvent.click(postButton);

    // Verify input fields are cleared after successful post creation
    await waitFor(() => {
      expect(contentTextarea).toHaveValue('');
    });

    // Verify navigation was called to redirect to home page
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/home');
    });
  });

  test('does not create post when title or content is empty', async () => {
    render(<BlogPostManager />);

    // Get input fields and button
    const titleInput = screen.getByPlaceholderText("Enter the title of your blog");
    const contentTextarea = screen.getByPlaceholderText("Write your blog content here...");
    const postButton = screen.getByText("Post");

    // Test with empty title
    fireEvent.change(titleInput, { target: { value: '' } });
    fireEvent.change(contentTextarea, { target: { value: 'Content without title' } });
    fireEvent.click(postButton);

    // Test with empty content
    fireEvent.change(titleInput, { target: { value: 'Title without content' } });
    fireEvent.change(contentTextarea, { target: { value: '' } });
    fireEvent.click(postButton);

    // Test with only whitespace
    fireEvent.change(titleInput, { target: { value: '   ' } });
    fireEvent.change(contentTextarea, { target: { value: '   ' } });
    fireEvent.click(postButton);

    // Verify createPost was not called in any of these cases
    await waitFor(() => {
      expect(blogPostService.createPost).not.toHaveBeenCalled();
    });
  });

  test('handles API error when creating post', async () => {
    // Mock API error
    const errorMessage = 'Error creating post';
    blogPostService.createPost.mockRejectedValue(new Error(errorMessage));
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<BlogPostManager />);

    // Get input fields and button
    const titleInput = screen.getByPlaceholderText("Enter the title of your blog");
    const contentTextarea = screen.getByPlaceholderText("Write your blog content here...");
    const postButton = screen.getByText("Post");

    // Simulate user typing and post creation
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentTextarea, { target: { value: 'Test Content' } });
    fireEvent.click(postButton);

    // Verify error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    // Navigation should not be called when there's an error
    expect(mockedNavigate).not.toHaveBeenCalled();

    // Restore console.error
    console.error.mockRestore();
  });

  test('handles API error when fetching posts', async () => {
    // Mock API error for getAllPosts
    const errorMessage = 'Error fetching posts';
    blogPostService.getAllPosts.mockRejectedValue(new Error(errorMessage));
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<BlogPostManager />);

    // Verify error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    // Restore console.error
    console.error.mockRestore();
  });
});