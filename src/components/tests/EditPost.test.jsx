import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditPost from '../EditPost';
import { blogPostService } from '../../services/api';

// Mock the router hooks
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useParams: () => ({ postId: '1' }),
}));

// Mock the blogPostService
jest.mock('../../services/api', () => ({
  blogPostService: {
    getPostById: jest.fn(),
    updatePost: jest.fn(),
  },
}));

describe('EditPost Component', () => {
  const mockPost = {
    id: '1',
    title: 'Test Title',
    content: 'Test Content',
    author: { username: 'testuser' },
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock successful post fetch
    blogPostService.getPostById.mockResolvedValue(mockPost);
  });

  test('renders the edit post form with fetched post data', async () => {
    render(
      <MemoryRouter initialEntries={['/posts/edit/1']}>
        <Routes>
          <Route path="/posts/edit/:postId" element={<EditPost />} />
        </Routes>
      </MemoryRouter>
    );

    // Check that the title is loaded
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    });
    
    // Check that the content is loaded
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Content')).toBeInTheDocument();
    });
    
    // Verify getPostById was called with the correct ID
    expect(blogPostService.getPostById).toHaveBeenCalledWith('1');
  });

  test('updates input fields on change', async () => {
    render(
      <MemoryRouter initialEntries={['/posts/edit/1']}>
        <Routes>
          <Route path="/posts/edit/:postId" element={<EditPost />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the post data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    });

    // Get the input fields
    const titleInput = screen.getByDisplayValue('Test Title');
    const contentInput = screen.getByDisplayValue('Test Content');

    // Change the title
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    expect(titleInput).toHaveValue('Updated Title');

    // Change the content
    fireEvent.change(contentInput, { target: { value: 'Updated Content' } });
    expect(contentInput).toHaveValue('Updated Content');
  });

  test('submits the form and updates the post', async () => {
    blogPostService.updatePost.mockResolvedValue({ success: true });

    render(
      <MemoryRouter initialEntries={['/posts/edit/1']}>
        <Routes>
          <Route path="/posts/edit/:postId" element={<EditPost />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the post data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    });

    // Change the title and content
    const titleInput = screen.getByDisplayValue('Test Title');
    const contentInput = screen.getByDisplayValue('Test Content');
    
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(contentInput, { target: { value: 'Updated Content' } });

    // Submit the form
    const submitButton = screen.getByText('Update Post');
    fireEvent.click(submitButton);

    // Check that updatePost was called with the correct data
    await waitFor(() => {
      expect(blogPostService.updatePost).toHaveBeenCalledWith('1', {
        title: 'Updated Title',
        content: 'Updated Content',
      });
    });

    // Check that we're redirected to the home page
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/home');
    });
  });

  test('displays error when fetching post fails', async () => {
    // Mock a failed post fetch
    blogPostService.getPostById.mockRejectedValue(new Error('Failed to fetch post'));

    render(
      <MemoryRouter initialEntries={['/posts/edit/1']}>
        <Routes>
          <Route path="/posts/edit/:postId" element={<EditPost />} />
        </Routes>
      </MemoryRouter>
    );

    // Check for the error message
    await waitFor(() => {
      expect(screen.getByText('Error fetching post details')).toBeInTheDocument();
    });
  });

  test('displays error when updating post fails', async () => {
    // Setup: First mock a successful fetch, then a failed update
    blogPostService.getPostById.mockResolvedValue(mockPost);
    blogPostService.updatePost.mockRejectedValue(new Error('Failed to update post'));

    render(
      <MemoryRouter initialEntries={['/posts/edit/1']}>
        <Routes>
          <Route path="/posts/edit/:postId" element={<EditPost />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the post data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    });

    // Submit the form without changes
    const submitButton = screen.getByText('Update Post');
    fireEvent.click(submitButton);

    // Check for the error message
    await waitFor(() => {
      expect(screen.getByText('Error updating post')).toBeInTheDocument();
    });
  });
});