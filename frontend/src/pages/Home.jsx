import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getCourses, createCourse } from "../services/courseService";
import CourseFormModal from "../components/CourseFormModal";

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState("");

  const getName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  useEffect(() => {
    if (!user?.email) return;

    let isMounted = true;

    const loadCourses = async () => {
      try {
        const data = await getCourses(user.email);
        if (isMounted) setCourses(data.courses);
      } catch (error) {
        console.error("Failed to fetch courses:", error.message);
      } finally {
        if (isMounted) setLoadingCourses(false);
      }
    };

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const refreshCourses = async () => {
    try {
      const data = await getCourses(user.email);
      setCourses(data.courses);
    } catch (error) {
      console.error("Failed to refresh courses:", error.message);
    }
  };

  const handleCreateCourse = async (formData) => {
    setGenerating(true);
    setFormError("");

    try {
      await createCourse({ ...formData, email: user.email });
      await refreshCourses();
      setShowModal(false);
    } catch (error) {
      setFormError(error.response?.data?.message || "Failed to generate course. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#15132B] ruled-bg">

      <div
        className="absolute w-[480px] h-[480px] rounded-full blob-a opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #7C5CFF, transparent 70%)", top: "-10%", right: "-10%" }}
      />
      <div
        className="absolute w-[420px] h-[420px] rounded-full blob-b opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #FF6B5E, transparent 70%)", bottom: "-10%", left: "-5%" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">

        <div className="rise-in flex items-center justify-between mb-10" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#7C5CFF]/30 blur-lg" />
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="profile"
                  className="relative w-12 h-12 rounded-full border-2 border-white/20"
                />
              ) : (
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#6845E8] flex items-center justify-center text-lg font-bold text-white">
                  {getName().charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-[#A9A4C2] text-xs font-medium tracking-widest uppercase">
                Welcome back
              </p>
              <h1 className="font-display text-xl font-bold text-white">
                {getName()}
              </h1>
            </div>
          </div>

          <button
            onClick={logout}
            className="bg-[#FF6B5E]/10 border border-[#FF6B5E]/30 hover:bg-[#FF6B5E] hover:border-[#FF6B5E] transition-all duration-200 text-[#FF6B5E] hover:text-white px-5 py-2.5 rounded-xl font-medium text-sm active:scale-[0.98]"
          >
            Logout
          </button>
        </div>

        <div
          className="rise-in bg-[#FAF8F3]/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 mb-8 flex items-center justify-between"
          style={{ animationDelay: "0.1s" }}
        >
          <div>
            <h2 className="font-display text-2xl font-bold text-white mb-1">
              Build your next course
            </h2>
            <p className="text-[#A9A4C2] text-sm">
              Generate a syllabus, study material, and assessments in minutes.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-[#7C5CFF] to-[#6845E8] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5 active:scale-[0.98] whitespace-nowrap"
          >
            + Create new course
          </button>
        </div>

        <div className="rise-in" style={{ animationDelay: "0.15s" }}>
          <h3 className="text-[#A9A4C2] text-xs font-medium tracking-widest uppercase mb-4">
            Your courses
          </h3>

          {loadingCourses ? (
            <div className="flex items-center gap-3 text-[#A9A4C2] text-sm">
              <div className="w-4 h-4 border-2 border-[#7C5CFF]/30 border-t-[#7C5CFF] rounded-full animate-spin" />
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-[#FAF8F3]/[0.04] border border-white/10 rounded-2xl p-10 text-center">
              <p className="text-white font-medium mb-1">No courses yet</p>
              <p className="text-[#A9A4C2] text-sm">
                Create your first course to see it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-5 hover:border-[#7C5CFF]/40 transition-all duration-200 cursor-pointer"
                >
                  <h4 className="text-white font-medium mb-2">{course.title}</h4>
                  <div className="flex gap-2">
                    {course.duration && (
                      <span className="text-xs text-[#A9A4C2] bg-white/5 px-2 py-1 rounded-md">
                        {course.duration}
                      </span>
                    )}
                    {course.difficulty && (
                      <span className="text-xs text-[#A9A4C2] bg-white/5 px-2 py-1 rounded-md">
                        {course.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {showModal && (
        <CourseFormModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateCourse}
          loading={generating}
        />
      )}

      {formError && (
        <div className="fixed bottom-6 right-6 bg-[#FF6B5E]/10 border border-[#FF6B5E]/30 text-[#FF6B5E] px-4 py-3 rounded-xl text-sm fade-in">
          {formError}
        </div>
      )}

    </div>
  );
}

export default Home;