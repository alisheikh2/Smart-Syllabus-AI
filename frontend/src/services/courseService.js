import api from "./api";

export const getCourses = async () => {
  const response = await api.get(`/courses`);
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

export const updateCourse = async (id, updates) => {
  const response = await api.patch(`/courses/${id}`, updates);
  return response.data;
};