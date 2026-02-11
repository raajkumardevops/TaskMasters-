import axiosInstance from "./axiosInstance";

// =========================
// TASK SERVICE
// =========================

// Get all tasks (with optional filters)
export const getTasks = async (filters = {}) => {
  const response = await axiosInstance.get("/tasks", { params: filters });
  return response.data; // { tasks }
};

// Get single task by ID
export const getTaskById = async (taskId) => {
  const response = await axiosInstance.get(`/tasks/${taskId}`);
  return response.data; // { task }
};

// Create new task
export const createTask = async (taskData) => {
  const response = await axiosInstance.post("/tasks", taskData);
  return response.data; // { task }
};

// Update task (title, category, date, status)
export const updateTask = async (taskId, updates) => {
  const response = await axiosInstance.put(`/tasks/${taskId}`, updates);
  return response.data; // { task }
};

// Toggle task completed / pending
export const toggleTaskStatus = async (taskId) => {
  const response = await axiosInstance.patch(`/tasks/${taskId}/toggle`);
  return response.data; // { task }
};

// Delete task
export const deleteTask = async (taskId) => {
  const response = await axiosInstance.delete(`/tasks/${taskId}`);
  return response.data; // { message }
};