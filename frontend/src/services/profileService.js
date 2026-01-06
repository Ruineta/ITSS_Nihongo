const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('token'); // Giả sử token được lưu trong localStorage
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return data.data.user; // Trả về data.data.user vì backend trả về { success: true, data: { user: {...} } }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const fetchUserStats = async () => {
  try {
    const token = localStorage.getItem('token'); // Giả sử token được lưu trong localStorage
    const response = await fetch(`${API_BASE_URL}/auth/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }

    const data = await response.json();
    return data.data; // Trả về data.data
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

export const fetchUserActivities = async (limit = 20) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/activities?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user activities');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};

// get public user profile by ID
export const fetchPublicUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/profile`);
    if (!response.ok) throw new Error('Failed to fetch public profile');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching public profile:', error);
    throw error;
  }
};

// get public user stats by ID
export const fetchPublicUserStats = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/stats`);
    if (!response.ok) throw new Error('Failed to fetch public stats');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching public stats:', error);
    throw error;
  }
};

// get public user activities by ID
export const fetchPublicUserActivities = async (userId, limit = 20) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/activities?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch public activities');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching public activities:', error);
    throw error;
  }
};

const profileService = {
  fetchUserProfile,
  fetchUserStats,
  fetchUserActivities,
  fetchPublicUserProfile,
  fetchPublicUserStats,
  fetchPublicUserActivities
};

export default profileService;