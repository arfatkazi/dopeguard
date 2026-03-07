// frontend/src/services/analyticsService.js
import axios from "axios";
axios.defaults.withCredentials = true;

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const fetchActivities = (params = {}) =>
  axios.get(`${BACKEND}/api/activity`, { params });

export const createActivity = (payload) =>
  axios.post(`${BACKEND}/api/activity`, payload);

export const fetchDailyStats = (days = 7) =>
  axios.get(`${BACKEND}/api/activity/stats/daily`, { params: { days } });

export const fetchWeeklyStats = () =>
  axios.get(`${BACKEND}/api/activity/stats/weekly`);

export const fetchBlockedSites = (limit = 10) =>
  axios.get(`${BACKEND}/api/activity/stats/blocked`, { params: { limit } });

export const fetchDopamineSpikes = () =>
  axios.get(`${BACKEND}/api/activity/stats/dopamine`);

export const fetchDevices = () => axios.get(`${BACKEND}/api/devices`);
export const removeDevice = (deviceId) =>
  axios.delete(`${BACKEND}/api/devices/${deviceId}`);
