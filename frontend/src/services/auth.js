const API_URL = "https://be.generateinvoice.id/api";

export const auth = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    return data.user;
  },

  register: async (name, email, password, password_confirmation) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name, email, password, password_confirmation }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const data = await response.json();
    return { message: data.message, user: data.user };
  },

  logout: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      localStorage.removeItem("token");
    }
  },

  me: async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await fetch(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      localStorage.removeItem("token");
      return null;
    }

    return await response.json();
  },

  updateProfile: async (name) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update profile");
    }

    return await response.json();
  },

  changePassword: async (
    current_password,
    new_password,
    new_password_confirmation,
  ) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password,
        new_password,
        new_password_confirmation,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to change password");
    }

    return await response.json();
  },

  upgrade: async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/upgrade`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Upgrade failed");
    }

    return await response.json();
  },

  verifyPayment: async (invoiceId) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/upgrade/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ invoice_id: invoiceId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Payment verification failed");
    }

    return await response.json();
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send reset link");
    }

    return await response.json();
  },

  resetPassword: async (email, password, password_confirmation, token) => {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password, password_confirmation, token }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to reset password");
    }

    return await response.json();
  },
};
