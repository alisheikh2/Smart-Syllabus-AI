import api from "./api";

export const createAssessment = async (assessmentData) => {
  const response = await api.post("/assessments", assessmentData);
  return response.data;
};

export const getAssessmentsByCourse = async (courseId) => {
  const response = await api.get(`/assessments/course/${courseId}`);
  return response.data;
};

// ✅ NEW
export const updateAssessment = async (id, updates) => {
  const response = await api.patch(`/assessments/${id}`, updates);
  return response.data;
};