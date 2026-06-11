import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/client";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const params = new URLSearchParams();
        params.append("username", email);
        params.append("password", password);
        const { data } = await api.post("/api/auth/login", params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        set({ user: data.user, token: data.access_token, isAuthenticated: true });
        localStorage.setItem("aniverse_token", data.access_token);
        return data;
      },

      register: async (username, email, password) => {
        const { data } = await api.post("/api/auth/register", { username, email, password });
        set({ user: data.user, token: data.access_token, isAuthenticated: true });
        localStorage.setItem("aniverse_token", data.access_token);
        return data;
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem("aniverse_token");
      },

      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
    }),
    { name: "AniMind-auth", partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
);

export default useAuthStore;
