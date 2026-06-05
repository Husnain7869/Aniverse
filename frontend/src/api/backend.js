import api from "./client";

// ── Watchlist ─────────────────────────────────────────────────────────────────
export const getLists    = (status) => api.get("/api/lists/", { params: status ? { status } : {} }).then(r => r.data);
export const addToList   = (data)   => api.post("/api/lists/", data).then(r => r.data);
export const updateEntry = (id, data) => api.patch(`/api/lists/${id}`, data).then(r => r.data);
export const deleteEntry = (id)     => api.delete(`/api/lists/${id}`);

// ── Stats (fully computed from DB — no hardcoding) ────────────────────────────
export const getStats = () => api.get("/api/stats/").then(r => r.data);

// ── Profile ───────────────────────────────────────────────────────────────────
export const getProfile      = () => api.get("/api/users/me").then(r => r.data);
export const updateProfile   = (data) => api.patch("/api/users/me", data).then(r => r.data);
export const getAchievements = () => api.get("/api/users/me/achievements").then(r => r.data);

// ── Personal Ratings (separate from AniList scores) ───────────────────────────
export const getRatings      = () => api.get("/api/ratings/").then(r => r.data);
export const getRatingFor    = (anilistId) => api.get(`/api/ratings/${anilistId}`).then(r => r.data).catch(() => null);
export const upsertRating    = (data) => api.post("/api/ratings/", data).then(r => r.data);
export const deleteRating    = (anilistId) => api.delete(`/api/ratings/${anilistId}`);

// ── AI Recommendations (with conversation history for memory) ──────────────────
export const getRecommendations = (prompt, conversationHistory = []) =>
  api.post("/api/recommendations/", { prompt, conversation_history: conversationHistory }).then(r => r.data);
export const getRecommendHistory = () => api.get("/api/recommendations/history").then(r => r.data);
