import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import Loader from "./components/Loader";

const Home = lazy(() => import("./pages/Home"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Analytics = lazy(() => import("./pages/Analytics"));

function MainApp(){const {user,loading}=useAuth();if(loading)return <Loader/>;if(!user)return <Login/>;return <Suspense fallback={<Loader/>}><Routes><Route path="/" element={<Home/>}/><Route path="/course/:id" element={<CourseDetail/>}/><Route path="/analytics" element={<Analytics/>}/><Route path="*" element={<Home/>}/></Routes></Suspense>}
export default function App(){return <AuthProvider><BrowserRouter><MainApp/></BrowserRouter></AuthProvider>}
