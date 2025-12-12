/**
 * Simple API Configuration
 * All backend API calls in one place
 */

// Backend URL from .env or default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';

/**
 * Simple fetch wrapper with error handling
 */
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error: ${response.status}`);
  }

  return response.json();
};

// ============================================
// Title API calls
// ============================================
export const getTitleById = (id) => apiCall(`/api/titles/${id}`);
export const getTitles = (pageNumber = 1, pageSize = 20) => 
  apiCall(`/api/titles?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getTitlePreview = (id) => apiCall(`/api/titles/${id}/preview`);

// Title related data (cast, similar, reviews) - TODO: Update endpoints when backend is ready
export const getTitleCast = (id) => apiCall(`/api/titles/${id}/cast`).catch(() => []);
export const getSimilarTitles = (id) => apiCall(`/api/titles/${id}/similar`).catch(() => []);
export const getTitleReviews = (id) => apiCall(`/api/titles/${id}/reviews`).catch(() => []);

// ============================================
// Individual (Person/Actor) API calls
// ============================================
export const getIndividualById = (id) => apiCall(`/api/individuals/${id}`);
export const getIndividuals = (pageNumber = 1, pageSize = 20) => 
  apiCall(`/api/individuals?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getIndividualReference = (id) => apiCall(`/api/individuals/${id}/reference`);

// ============================================
// Rating API calls
// ============================================
export const getRatingByCompositeId = (userId, titleId) => 
  apiCall(`/api/ratings/${userId}/${titleId}`);
export const getRatingsByUserId = (userId) => 
  apiCall(`/api/ratings?userId=${userId}`);
export const getRatingsByTitleId = (titleId) => 
  apiCall(`/api/ratings?titleId=${titleId}`);

// ============================================
// Bookmark API calls (require authentication)
// ============================================
export const getBookmarks = (token) => 
  apiCall('/api/bookmarks', { 
    headers: { Authorization: `Bearer ${token}` } 
  });

export const createBookmark = (pconst, token) => 
  apiCall('/api/bookmarks', { 
    method: 'POST', 
    body: JSON.stringify({ pconst }),
    headers: { Authorization: `Bearer ${token}` }
  });

export const deleteBookmark = (pconst, token) => 
  apiCall(`/api/bookmarks/${pconst}`, { 
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

// ============================================
// Auth API calls
// ============================================
export const login = (username, password) => 
  apiCall('/api/user/login', { 
    method: 'POST', 
    body: JSON.stringify({ username, password }) 
  });

export const signup = (name, username, password, email, role = 'User') => 
  apiCall('/api/user', { 
    method: 'POST', 
    body: JSON.stringify({ name, username, password, email, role }) 
  });

// ============================================
// Search API calls (if available)
// ============================================
export const searchTitles = (query) => 
  apiCall(`/api/titles/search?q=${encodeURIComponent(query)}`).catch(() => []);

export const searchIndividuals = (query) => 
  apiCall(`/api/individuals/search?q=${encodeURIComponent(query)}`).catch(() => []);

export default API_BASE_URL;
