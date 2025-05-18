
/**
 * API utility functions for making fetch requests
 */

// Define API URL base - Change this to your actual EC2 endpoint when deployed
export const API_BASE_URL = process.env.NODE_ENV === "production" 
  ? "https://api.umistore.com" // Replace with your actual production API URL
  : "https://api.umistore.com"; // For development

// Fallback for demo when API is unavailable
export const IS_DEMO_MODE = process.env.NODE_ENV !== "production";

// Cache for API responses
const apiCache = new Map();

// Error handling utilities
const handleApiError = (error: any, endpoint: string) => {
  console.error(`API request failed for ${endpoint}:`, error);
  
  // Log to monitoring service in production
  if (process.env.NODE_ENV === "production") {
    // Add your error tracking service here
    // Example: Sentry.captureException(error);
  }
  
  // Format the error for consistent handling
  if (error instanceof Error) {
    return error;
  }
  return new Error('Unknown error occurred during API request');
};

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
  const token = localStorage.getItem('auth-token') || localStorage.getItem('token');
  
  // Prepare headers with auth token if available
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  
  try {
    // Performance measurement
    const startTime = performance.now();
    
    // In demo mode, simulate API responses
    if (IS_DEMO_MODE) {
      // This will be used for development and testing
      const demoData = await simulateDemoResponse(endpoint, options);
      
      // Cache the response if it's a GET request
      if (options.method === undefined || options.method === 'GET') {
        apiCache.set(cacheKey, {
          data: demoData,
          expiry: Date.now() + cacheTime
        });
      }
      
      const endTime = performance.now();
      console.log(`Demo API request to ${endpoint} took ${endTime - startTime}ms`);
      
      return demoData;
    }
    
    // Make the actual API request for production
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
    // Enhanced error handling
    const formattedError = handleApiError(error, endpoint);
    
    // Implement basic retry logic for network issues
    if (formattedError.message.includes('network') || formattedError.message.includes('failed to fetch')) {
      console.log('Network error, retrying once...');
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
        return await response.json();
      } catch (retryError) {
        throw handleApiError(retryError, `${endpoint} (retry)`);
      }
    }
    
    throw formattedError;
  }
};

// Function to simulate demo responses
const simulateDemoResponse = async (endpoint: string, options: RequestInit = {}) => {
  // Import demo data dynamically to avoid loading it in production
  const { products, categories } = await import('./data');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Simulate different API endpoints
  if (endpoint.startsWith('/api/products')) {
    if (endpoint === '/api/products') {
      // Filter products based on query params if provided
      const url = new URL(`http://example.com${endpoint}`);
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');
      const promo = url.searchParams.get('promo');
      
      let filteredProducts = [...products];
      
      if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description.toLowerCase().includes(searchLower)
        );
      }
      
      if (promo === 'true') {
        filteredProducts = filteredProducts.filter(p => p.isPromo);
      }
      
      return { products: filteredProducts };
    } else {
      // Get single product details
      const productId = endpoint.split('/').pop();
      const product = products.find(p => p.id === productId);
      
      if (product) {
        // Find related products in same category
        const relatedProducts = products
          .filter(p => p.category === product.category && p.id !== product.id)
          .slice(0, 4);
          
        return { product, relatedProducts };
      }
      
      throw new Error('Product not found');
    }
  }
  
  // Login API handling
  if (endpoint === '/api/login') {
    const { email, password } = JSON.parse(options.body as string);
    
    // Check for admin user
    if (email === "matdew444@outlook.com" && password === "123098") {
      return {
        token: "admin-demo-token",
        user: {
          id: "admin-1",
          name: "Admin User",
          email: email,
          role: "admin"
        }
      };
    }
    
    // For demo purposes, accept any login
    return {
      token: "user-demo-token",
      user: {
        id: "user-" + Math.floor(Math.random() * 1000),
        name: email.split('@')[0],
        email: email,
        role: "customer"
      }
    };
  }
  
  // Register API handling
  if (endpoint === '/api/register') {
    const userData = JSON.parse(options.body as string);
    
    return {
      token: "user-demo-token",
      user: {
        id: "user-" + Math.floor(Math.random() * 1000),
        name: userData.name,
        email: userData.email,
        role: "customer"
      }
    };
  }
  
  // Social login API handling
  if (endpoint.startsWith('/api/auth/')) {
    const provider = endpoint.split('/').pop();
    
    return {
      token: `${provider}-demo-token`,
      user: {
        id: `${provider}-user-` + Math.floor(Math.random() * 1000),
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        email: `user-${Math.floor(Math.random() * 1000)}@${provider}.com`,
        role: "customer"
      }
    };
  }
  
  // Return categories
  if (endpoint === '/api/categories') {
    return { categories };
  }
  
  // Default response
  return { message: "Endpoint not implemented in demo mode" };
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
 * @param provider - Social provider (google, whatsapp, etc.)
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

/**
 * Get categories API request
 */
export const getCategories = async () => {
  return apiRequest(
    '/api/categories',
    undefined,
    3600000 // Cache categories for 1 hour
  );
};

/**
 * Place order API request
 * @param orderData - Order data
 */
export const placeOrder = async (orderData: any) => {
  return apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

/**
 * Get user orders API request
 */
export const getUserOrders = async () => {
  return apiRequest('/api/user/orders');
};

/**
 * Get all orders API request (admin only)
 */
export const getAllOrders = async () => {
  return apiRequest('/api/admin/orders');
};

/**
 * Update order status API request (admin only)
 * @param orderId - Order ID
 * @param status - New status
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  return apiRequest(`/api/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

/**
 * Create product API request (admin only)
 * @param productData - Product data
 */
export const createProduct = async (productData: any) => {
  return apiRequest('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

/**
 * Update product API request (admin only)
 * @param productId - Product ID
 * @param productData - Product data
 */
export const updateProduct = async (productId: string, productData: any) => {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};

/**
 * Delete product API request (admin only)
 * @param productId - Product ID
 */
export const deleteProduct = async (productId: string) => {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: 'DELETE',
  });
};
