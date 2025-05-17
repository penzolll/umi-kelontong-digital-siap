
/**
 * API utility functions for making fetch requests
 */

// Define API URL base
export const API_BASE_URL = "https://api.umistore.com";

// Fallback for demo when API is unavailable
export const IS_DEMO_MODE = true;

/**
 * Generic API request function with authentication
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @returns Promise with response data
 */
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Get auth token from localStorage
  const token = localStorage.getItem('auth-token');
  
  // Prepare headers with auth token if available
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  
  try {
    // Make the API request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Parse response body as JSON
    const data = await response.json();
    
    // Handle non-2xx responses
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    
    return data;
  } catch (error) {
    // Re-throw the error for the caller to handle
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during API request');
  }
};

/**
 * Login API request
 * @param email - User email
 * @param password - User password
 */
export const login = async (email: string, password: string) => {
  return apiRequest('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

/**
 * Register API request
 * @param userData - User registration data
 */
export const register = async (userData: { name: string, email: string, password: string }) => {
  return apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

/**
 * Social login API request
 * @param provider - Social provider (google, apple, etc.)
 */
export const socialLogin = async (provider: string) => {
  return apiRequest(`/api/auth/${provider}`, {
    method: 'GET',
    credentials: 'include',
  });
};

/**
 * Get products API request
 * @param options - Query parameters
 */
export const getProducts = async (options?: { category?: string, search?: string, promo?: boolean }) => {
  const queryParams = new URLSearchParams();
  
  if (options?.category) queryParams.append('category', options.category);
  if (options?.search) queryParams.append('search', options.search);
  if (options?.promo) queryParams.append('promo', 'true');
  
  const queryString = queryParams.toString();
  return apiRequest(`/api/products${queryString ? `?${queryString}` : ''}`);
};

/**
 * Get product details API request
 * @param productId - Product ID
 */
export const getProductDetails = async (productId: string) => {
  return apiRequest(`/api/products/${productId}`);
};
