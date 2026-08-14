import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import { Brand } from "./layout/AppShell";
import Icon from "./ui/Icon";
import "../auth.css";

const friendlyAuthError = (error) => {
  const code = error?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "The email or password is incorrect. Check both fields and try again.";
  if (code.includes("email-already-in-use")) return "An account already exists for this email. Sign in instead or reset the password.";
  if (code.includes("weak-password")) return "Use at least six characters and avoid an easily guessed password.";
  if (code.includes("invalid-email")) return "Enter a valid email address, such as name@example.com.";
  if (code.includes("too-many-requests")) return "Sign-in has been temporarily limited. Wait a moment before trying again.";
  if (code.includes("popup-closed")) return "Google sign-in was closed before it finished.";
  if (code.includes("popup-blocked")) return "Your browser blocked the Google sign-in window. Allow popups and try again.";
  if (code.includes("network")) return "The authentication service could not be reached. Check your connection and try again.";
  return "Authentication could not be completed. Please try again.";
};

export default function Login() {
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const isRegister = mode === "register";

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setInfo("");
  };

  const handleGoogleLogin = async () => {
    setBusy(true); setError(""); setInfo("");
    try { await signInWithPopup(auth, googleProvider); }
    catch (err) { setError(friendlyAuthError(err)); }
    finally { setBusy(false); }
  };

  const handleEmailAuth = async (event) => {
    event.preventDefault();
    setError(""); setInfo("");
    if (isRegister && name.trim().length < 2) { setError("Enter the name you want displayed in your learning workspace."); return; }
    if (password.length < 6) { setError("Your password must contain at least six characters."); return; }
    setBusy(true);
    try {
      if (isRegister) {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(credential.user, { displayName: name.trim() });
        await refreshUser();
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) { setError(friendlyAuthError(err)); }
    finally { setBusy(false); }
  };

  const handleForgotPassword = async () => {
    setError(""); setInfo("");
    if (!email.trim()) { setError("Enter your email first so we know where to send the reset link."); return; }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo("Password reset instructions have been sent. Check your inbox and spam folder.");
    } catch (err) { setError(friendlyAuthError(err)); }
    finally { setBusy(false); }
  };

  return <main className="auth-page">
    <section className="auth-story" aria-label="SmartSyllabusAI introduction">
      <div className="auth-story-top"><Brand/><span className="auth-status"><i/>AI curriculum service online</span></div>
      <div className="auth-story-copy">
        <span className="auth-eyebrow">A clearer way to build knowledge</span>
        <h1>One topic.<br/><span>A complete learning path.</span></h1>
        <p>Build sequenced modules, focused study material, Bloom-aligned assessments and practical assignments in one editable workspace.</p>
        <div className="auth-outcomes">
          <article><span>01</span><div><strong>Structure before content</strong><small>Turn scope and duration into a progression learners can follow.</small></div></article>
          <article><span>02</span><div><strong>Assess with intent</strong><small>Control difficulty, marks and cognitive depth for every assessment.</small></div></article>
          <article><span>03</span><div><strong>Edit, reuse and export</strong><small>Refine generated material and keep each course ready to revisit.</small></div></article>
        </div>
      </div>
      <div className="auth-story-foot"><span>Built for students, educators and independent learners.</span><div><i>KaTeX</i><i>PDF</i><i>Bloom</i></div></div>
    </section>

    <section className="auth-panel" aria-labelledby="auth-title">
      <div className="auth-mobile-brand"><Brand/></div>
      <div className="auth-card">
        <header>
          <span className="auth-eyebrow">Your learning workspace</span>
          <h2 id="auth-title">{isRegister ? "Create your account" : "Welcome back"}</h2>
          <p>{isRegister ? "Set up a workspace for the courses and material you generate." : "Sign in to continue building and reviewing your courses."}</p>
        </header>

        <div className="auth-switch" role="tablist" aria-label="Authentication options">
          <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? "active" : ""} onClick={() => changeMode("signin")}>Sign in</button>
          <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? "active" : ""} onClick={() => changeMode("register")}>Create account</button>
        </div>

        <button type="button" className="google-auth-button" onClick={handleGoogleLogin} disabled={busy}>
          <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3A12 12 0 1 1 32 15l5.7-5.6A20 20 0 1 0 44 24c0-1.3-.1-2.6-.4-3.9Z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 32 15l5.7-5.6A20 20 0 0 0 6.3 14.7Z"/><path fill="#4CAF50" d="M24 44c5 0 9.7-1.9 13.3-5.1l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44Z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3a12 12 0 0 1-4.2 5.7l6.2 5.2C41.2 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4Z"/></svg>
          Continue with Google
        </button>

        <div className="auth-divider"><span>or use your email</span></div>

        <form className="auth-form" onSubmit={handleEmailAuth} noValidate>
          {isRegister && <label>Display name<span>Used to personalize your workspace.</span><input type="text" value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="e.g. Ayesha Khan" required/></label>}
          <label>Email address<span>{isRegister ? "Used for sign-in and account recovery." : "The email linked to your workspace."}</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="name@example.com" required/></label>
          <label>Password<span>{isRegister ? "Use at least six characters." : "Enter your account password."}</span><div className="password-field"><input type={showPassword ? "text" : "password"} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={isRegister ? "new-password" : "current-password"} placeholder={isRegister ? "Create a password" : "Enter your password"} required/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div></label>
          {!isRegister && <button type="button" className="forgot-button" onClick={handleForgotPassword} disabled={busy}>Forgot password?</button>}
          {error && <div className="auth-message error" role="alert"><Icon name="close" size={15}/><span>{error}</span></div>}
          {info && <div className="auth-message info" role="status"><Icon name="check" size={15}/><span>{info}</span></div>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? <><i/>Please wait…</> : isRegister ? <>Create my workspace <Icon name="arrow" size={16}/></> : <>Sign in to workspace <Icon name="arrow" size={16}/></>}</button>
        </form>
        <p className="auth-terms">By continuing, you agree to use generated material responsibly and review AI output before sharing it with learners.</p>
      </div>
    </section>
  </main>;
}
