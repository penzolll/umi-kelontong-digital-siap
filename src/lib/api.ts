/**
 * API utility functions for making fetch requests
 */

// Define API URL base
export const API_BASE_URL = "https://api.umistore.com";

// Fallback for demo when API is unavailable
export const IS_DEMO_MODE = true;

// Cache for API responses
const apiCache = new Map();

/**
 * Generic API request function with authentication and caching
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @param cacheTime - Time in milliseconds to cache the response (default: 5 minutes)
 * @returns Promise with response data
 */
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {},
  cacheTime: number = 300000
) => {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
  
  // Check cache first if it's a GET request
  if (options.method === undefined || options.method === 'GET') {
    const cachedResponse = apiCache.get(cacheKey);
    if (cachedResponse && cachedResponse.expiry > Date.now()) {
      console.log('Using cached response for:', endpoint);
      return cachedResponse.data;
    }
  }
  
  // Get auth token from localStorage
  const token = localStorage.getItem('auth-token');
  
  // Prepare headers with auth token if available
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  
  try {
    // Performance measurement
    const startTime = performance.now();
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Parse response body as JSON
    const data = await response.json();
    
    // Log performance
    const endTime = performance.now();
    console.log(`API request to ${endpoint} took ${endTime - startTime}ms`);
    
    // Handle non-2xx responses
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    
    // Cache the response if it's a GET request
    if (options.method === undefined || options.method === 'GET') {
      apiCache.set(cacheKey, {
        data,
        expiry: Date.now() + cacheTime
      });
    }
    
    return data;
  } catch (error) {
    // Improved error handling with retry mechanism
    console.error(`API request failed for ${endpoint}:`, error);
    
    // Re-throw the error for the caller to handle
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during API request');
  }
};

/**
 * Clear API cache
 * @param endpoint - Optional endpoint to clear specific cache entry
 */
export const clearApiCache = (endpoint?: string) => {
  if (endpoint) {
    // Clear specific endpoint cache entries
    apiCache.forEach((_, key) => {
      if (key.startsWith(endpoint)) {
        apiCache.delete(key);
      }
    });
  } else {
    // Clear all cache
    apiCache.clear();
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
 * Get products API request with optimized caching
 * @param options - Query parameters
 */
export const getProducts = async (options?: { category?: string, search?: string, promo?: boolean }) => {
  const queryParams = new URLSearchParams();
  
  if (options?.category) queryParams.append('category', options.category);
  if (options?.search) queryParams.append('search', options.search);
  if (options?.promo) queryParams.append('promo', 'true');
  
  const queryString = queryParams.toString();
  return apiRequest(
    `/api/products${queryString ? `?${queryString}` : ''}`,
    undefined,
    600000 // Cache products for 10 minutes
  );
};

/**
 * Get product details API request with caching
 * @param productId - Product ID
 */
export const getProductDetails = async (productId: string) => {
  return apiRequest(
    `/api/products/${productId}`,
    undefined,
    900000 // Cache product details for 15 minutes
  );
};
