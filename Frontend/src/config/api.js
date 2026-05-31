// src/config/api.js
// Get the API URL from environment or detect from hostname
const getAPIURL = () => {
  // Always auto-detect the backend URL from current hostname
  // This allows frontend running on localhost:3000 or 10.17.86.43:3000 to reach backend on same IP:5000
  const host = window.location.hostname;
  const apiUrl = `http://${host}:5000/api`;
  console.log(`🌐 API URL: ${apiUrl} (detected from hostname: ${host})`);
  return apiUrl;
};

const API_URL = getAPIURL();
console.log('🌐 API Configuration loaded');

// Helper function to make API calls with token
export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'API Error');
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Helper for GET requests
export function get(endpoint) {
  return apiCall(endpoint, { method: 'GET' });
}

// Helper for POST requests
export function post(endpoint, data) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Helper for PUT requests
export function put(endpoint, data) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Helper for DELETE requests
export function del(endpoint) {
  return apiCall(endpoint, { method: 'DELETE' });
}

export default {
  apiCall,
  get,
  post,
  put,
  delete: del,
};
