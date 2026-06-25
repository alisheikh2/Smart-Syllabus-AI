import { useAuth } from "../hooks/useAuth";
import Loader from "./Loader";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  if (!user) {
    return <div className="text-center mt-10">Access Denied</div>;
  }

  return children;
}

export default ProtectedRoute; 