import api from "./api";

export const createAssignment = async (data) => {
  const response = await api.post("/assignments", data);
  return response.data;
};

export const getAssignmentsByCourse = async (courseId) => {
  const response = await api.get(`/assignments/course/${courseId}`);
  return response.data;
};

// ✅ NEW
export const updateAssignment = async (id, updates) => {
  const response = await api.patch(`/assignments/${id}`, updates);
  return response.data;
};

export const deleteAssignment = async (id) => {
  const response = await api.delete(`/assignments/${id}`);
  return response.data;
};