import axiosInstance from "./axiosInstance";

// =========================
// AUTH SERVICE
// =========================

// Login user
export const loginUser = async (credentials) => {
  const response = await axiosInstance.post("/auth/login", credentials);
  return response.data; // { user, accessToken }
};

// Register user
export const registerUser = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);
  return response.data; // { message }
};

// Forgot password (send reset email)
export const forgotPassword = async (email) => {
  const response = await axiosInstance.post("/auth/forgot-password", { email });
  return response.data; // { message }
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  const response = await axiosInstance.post(`/auth/reset-password/${token}`, {
    password: newPassword,
  });
  return response.data; // { message }
};

// Logout user (optional backend call)
export const logoutUser = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};