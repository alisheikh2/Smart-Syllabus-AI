import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";

import { auth, googleProvider } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async () => {
    setError("");
    setInfo("");

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(userCredential.user, {
          displayName: name,
        });

        await refreshUser();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setInfo("");

    if (!email) {
      setError("Please enter your email first");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setInfo("If this email is registered, a reset link has been sent. Check your inbox and spam folder.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#15132B] ruled-bg">

      <div
        className="absolute w-[480px] h-[480px] rounded-full blob-a opacity-30 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #7C5CFF, transparent 70%)", top: "-10%", left: "-10%" }}
      />
      <div
        className="absolute w-[420px] h-[420px] rounded-full blob-b opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #FF6B5E, transparent 70%)", bottom: "-10%", right: "-5%" }}
      />

      <div
        className="relative z-10 rise-in bg-[#FAF8F3]/[0.06] backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-9 w-96 flex flex-col gap-5"
        style={{ animationDelay: "0.05s" }}
      >

        <div className="flex flex-col gap-1 mb-1 rise-in" style={{ animationDelay: "0.1s" }}>
          <span className="text-[#A9A4C2] text-xs font-medium tracking-widest uppercase">
            Welcome to
          </span>
          <h1 className="font-display text-3xl font-bold text-white leading-tight">
            SmartSyllabus<span className="text-[#7C5CFF]">AI</span>
          </h1>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="group rise-in relative bg-white text-[#15132B] py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden"
          style={{ animationDelay: "0.15s" }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
          </svg>
          <span className="relative z-10">Sign in with Google</span>
        </button>

        <div className="flex items-center gap-3 rise-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex-1 h-px bg-white/15" />
          <span className="text-[#A9A4C2] text-xs font-medium">OR</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        <div className="flex flex-col gap-3 rise-in" style={{ animationDelay: "0.25s" }}>
          {isRegister && (
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-white placeholder-[#A9A4C2] text-sm outline-none focus:border-[#7C5CFF] focus:bg-white/[0.1] transition-all duration-200"
            />
          )}

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-white placeholder-[#A9A4C2] text-sm outline-none focus:border-[#7C5CFF] focus:bg-white/[0.1] transition-all duration-200"
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-white placeholder-[#A9A4C2] text-sm outline-none focus:border-[#7C5CFF] focus:bg-white/[0.1] transition-all duration-200"
          />

          {!isRegister && (
            <p
              onClick={handleForgotPassword}
              className="text-[#A9A4C2] text-xs text-right cursor-pointer hover:text-[#7C5CFF] transition-colors duration-200 -mt-1"
            >
              Forgot password?
            </p>
          )}
        </div>

        {error && (
          <p className="fade-in text-[#FF6B5E] text-sm bg-[#FF6B5E]/10 border border-[#FF6B5E]/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {info && (
          <p className="fade-in text-[#7C5CFF] text-sm bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 rounded-lg px-3 py-2">
            {info}
          </p>
        )}

        <button
          onClick={handleEmailAuth}
          className="rise-in bg-gradient-to-r from-[#7C5CFF] to-[#6845E8] text-white py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ animationDelay: "0.3s" }}
        >
          {isRegister ? "Create account" : "Login"}
        </button>

        <p
          onClick={() => setIsRegister(!isRegister)}
          className="rise-in text-[#A9A4C2] text-center text-sm cursor-pointer transition-colors duration-200"
          style={{ animationDelay: "0.35s" }}
        >
          {isRegister ? (
            <>Already have an account? <span className="text-[#7C5CFF] font-medium hover:text-[#9B82FF]">Login instead</span></>
          ) : (
            <>New here? <span className="text-[#7C5CFF] font-medium hover:text-[#9B82FF]">Create account</span></>
          )}
        </p>

      </div>
    </div>
  );
}

export default Login;