import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const goalService = {
  generateGoal: async (payload) => {
    const response = await axios.post(`${API_BASE_URL}/goals/generate`, payload);
    return response.data;
  },

  toggleTask: async (goalId, milestoneIndex, taskIndex, isCompleted) => {
    const response = await axios.patch(`${API_BASE_URL}/goals/${goalId}/tasks`, {
      milestoneIndex,
      taskIndex,
      isCompleted
    });
    return response.data;
  },

  getDailyQuote: async () => {
    const response = await axios.get(`${API_BASE_URL}/motivation/quote`);
    return response.data;
  },

  getWeeklyReview: async (goalId, milestoneIndex) => {
    const response = await axios.post(`${API_BASE_URL}/goals/${goalId}/review`, {
      milestoneIndex
    });
    return response.data;
  }
};
