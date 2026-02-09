import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };
};

const admin = {
  getStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`, getHeaders());
      return response.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  },

  getUsers: async (page = 1, search = "", plan = "") => {
    try {
      const params = { page };
      if (search) params.search = search;
      if (plan) params.plan = plan;

      const response = await axios.get(`${API_URL}/admin/users`, {
        ...getHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/users/${id}`,
        data,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  getPayments: async (page = 1, status = "") => {
    try {
      const params = { page };
      if (status) params.status = status;

      const response = await axios.get(`${API_URL}/admin/payments`, {
        ...getHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },
};

export default admin;
