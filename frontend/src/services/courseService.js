import api from "./api";

export const getCourses = async (email) => {
  const response = await api.get(`/courses?email=${email}`);
  return response.data;
};

export const getCourseById = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await api.post("/courses", courseData);
  return response.data;
};

// ✅ NEW
export const updateCourse = async (id, updates) => {
  const response = await api.patch(`/courses/${id}`, updates);
  return response.data;
};