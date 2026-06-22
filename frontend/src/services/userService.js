import api from "./api";

export const syncUser = async (userData) => {
  const response = await api.post("/users/sync", userData);
  return response.data;
};