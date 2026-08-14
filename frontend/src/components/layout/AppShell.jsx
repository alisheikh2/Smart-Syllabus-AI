import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Icon from "../ui/Icon";

export function Brand() {
  return <span className="brand" aria-label="SmartSyllabusAI">
    <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path className="logo-link" d="M10 8.5 16 5l6 3.5M16 5v6"/><circle className="logo-node" cx="10" cy="8.5" r="2.2"/><circle className="logo-node" cx="16" cy="4.7" r="2.2"/><circle className="logo-node" cx="22" cy="8.5" r="2.2"/><path className="logo-book" d="M4.5 12.5c4.7-.6 8.6.6 11.5 3.5v11c-2.9-2.9-6.8-4.1-11.5-3.5v-11ZM27.5 12.5c-4.7-.6-8.6.6-11.5 3.5v11c2.9-2.9 6.8-4.1 11.5-3.5v-11Z"/><path className="logo-spine" d="M16 16v11"/></svg></span>
    <span className="brand-name">SmartSyllabus<span>AI</span></span>
  </span>;
}

export default function AppShell({ children, onGenerate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const name = user?.displayName || user?.email?.split("@")[0] || "Learner";

  const homeSection = (id) => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const generate = () => {
    setMobileOpen(false);
    if (onGenerate) onGenerate();
    else navigate("/#generate");
  };

  return <div className="site-shell">
    <header className="site-nav-wrap">
      <nav className="site-nav" aria-label="Primary navigation">
        <button className="brand-button" onClick={() => navigate("/")}><Brand /></button>
        <div className="desktop-links">
          <button onClick={() => homeSection("product")}>Product</button>
          <button onClick={() => homeSection("courses")}>Courses</button>
          <button className={location.pathname === "/analytics" ? "active" : ""} onClick={() => navigate("/analytics")}>Analytics</button>
          <button onClick={() => homeSection("learning-guide")}>How it works</button>
        </div>
        <div className="nav-actions">
          <button className="profile-trigger" onClick={() => setProfileOpen(v => !v)} aria-expanded={profileOpen}>
            <span className="avatar">{user?.photoURL ? <img src={user.photoURL} alt="" /> : name[0]?.toUpperCase()}</span>
            <span>{name}</span>
          </button>
          <button className="nav-cta" onClick={generate}><Icon name="spark" size={15}/>Create a course</button>
          <button className={`menu-toggle ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(v => !v)} aria-label="Toggle navigation" aria-expanded={mobileOpen}><i/><i/><i/></button>
          {profileOpen && <div className="profile-menu">
            <div><strong>{name}</strong><small>{user?.email}</small></div>
            <button onClick={() => {setProfileOpen(false);navigate("/analytics")}}><Icon name="chart"/>View analytics</button>
            {user?.isDemo ? <button onClick={() => setProfileOpen(false)}><Icon name="spark"/>Preview mode active</button> : <button className="danger" onClick={logout}><Icon name="logout"/>Sign out</button>}
          </div>}
        </div>
      </nav>
      {mobileOpen && <div className="mobile-menu">
        <button onClick={() => homeSection("product")}>Product</button>
        <button onClick={() => homeSection("courses")}>Courses</button>
        <button onClick={() => {setMobileOpen(false);navigate("/analytics")}}>Analytics</button>
        <button onClick={() => homeSection("learning-guide")}>How it works</button>
        <button className="mobile-create" onClick={generate}>Create a course</button>
      </div>}
    </header>
    <main className="site-main">{children}</main>
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-intro"><Brand/><p>Build focused courses, grounded assessments and reusable study material from one clear learning goal.</p><span><i/>AI generation services available</span></div>
        <div><h3>Product</h3><button onClick={() => homeSection("product")}>Course generator</button><button onClick={() => homeSection("courses")}>Course library</button><button onClick={() => navigate("/analytics")}>Learning analytics</button></div>
        <div><h3>Learning</h3><button onClick={() => homeSection("learning-guide")}>Generation workflow</button><button onClick={() => homeSection("assessment-design")}>Assessment design</button><button onClick={generate}>Start a new course</button></div>
        <div><h3>Project</h3><a href="https://github.com/alisheikh2/Smart-Syllabus-AI" target="_blank" rel="noreferrer">GitHub repository</a><a href="https://smart-syllabus-ai.vercel.app" target="_blank" rel="noreferrer">Production application</a></div>
      </div>
      <div className="footer-bottom"><span>© 2026 SmartSyllabusAI</span><span>Structured learning, generated with intent.</span></div>
    </footer>
  </div>;
}
