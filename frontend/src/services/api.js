import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const searchCafes = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { query }
    });
    return response.data.results;
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};
