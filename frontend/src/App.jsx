import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./pages/Home";
import CourseDetail from "./pages/CourseDetail";
import Analytics from "./pages/Analytics";           
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import Loader from "./components/Loader";

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user)   return <Login />;

  return (
    <Routes>
      <Route path="/"             element={<Home />} />
      <Route path="/course/:id"   element={<CourseDetail />} />
      <Route path="/analytics"    element={<Analytics />} />  
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;