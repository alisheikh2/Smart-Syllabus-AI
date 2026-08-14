import { useEffect, useRef, useState } from "react";
import Icon from "./ui/Icon";

const progressSteps = ["Understanding your topic…", "Building the syllabus…", "Generating learning material…", "Preparing assessments…"];

export default function CourseFormModal({ onClose, onSubmit, loading }) {
  const [topic,setTopic]=useState(""); const [audience,setAudience]=useState(""); const [duration,setDuration]=useState(""); const [difficulty,setDifficulty]=useState("Beginner"); const [depth,setDepth]=useState("Balanced"); const [step,setStep]=useState(0); const [error,setError]=useState("");
  const dialog=useRef(null); const first=useRef(null);
  useEffect(()=>{ first.current?.focus(); const key=e=>{ if(e.key==="Escape"&&!loading) onClose(); if(e.key==="Tab"&&dialog.current){const f=[...dialog.current.querySelectorAll("button,input,select")].filter(x=>!x.disabled); if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0].focus()}}}; document.addEventListener("keydown",key); document.body.style.overflow="hidden"; return()=>{document.removeEventListener("keydown",key);document.body.style.overflow=""}},[onClose,loading]);
  useEffect(()=>{if(!loading)return; const id=setInterval(()=>setStep(s=>(s+1)%progressSteps.length),2400); return()=>clearInterval(id)},[loading]);
  const submit=e=>{e.preventDefault(); if(!topic.trim()||!audience.trim()||!duration.trim()){setError("Please complete the topic, audience, and duration fields.");return} setError(""); onSubmit({topic:topic.trim(),audience:audience.trim(),duration:duration.trim(),difficulty,contentDepth:depth});};
  return <div className="modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget&&!loading)onClose()}}><section ref={dialog} className="modal-card" role="dialog" aria-modal="true" aria-labelledby="course-modal-title">
    <header className="modal-header"><div><span className="section-kicker">AI course generator</span><h2 id="course-modal-title">Create a learning experience</h2><p>Tell us what you want to learn. AI will build the complete curriculum.</p></div><button className="icon-button" aria-label="Close dialog" onClick={onClose} disabled={loading}><Icon name="close"/></button></header>
    {loading ? <div className="generation-state" role="status" aria-live="polite"><div className="generation-orb"><i/><i/><i/></div><span>Creating your course</span><h3>{progressSteps[step]}</h3><p>SmartSyllabusAI is structuring content around your goals. This may take a moment.</p><div className="generation-steps">{progressSteps.map((x,i)=><i key={x} className={i<=step?"active":""}/>)}</div></div> : <form onSubmit={submit} className="modal-form">
      <label>Course topic<span>What would you like to master?</span><input ref={first} value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. JavaScript Promises" autoComplete="off"/></label>
      <label>Target audience<span>Who is this learning path for?</span><input value={audience} onChange={e=>setAudience(e.target.value)} placeholder="e.g. Computer science students"/></label>
      <div className="form-row"><label>Duration<span>Preferred pace</span><input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="e.g. 8 weeks"/></label><label>Difficulty<span>Starting level</span><select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label></div>
      <label>Content depth<span>How comprehensive should it be?</span><select value={depth} onChange={e=>setDepth(e.target.value)}><option>Concise</option><option>Balanced</option><option>Comprehensive</option></select></label>
      {error&&<p className="form-error" role="alert">{error}</p>}
      <footer className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" type="submit"><Icon name="spark"/>Generate with AI</button></footer>
    </form>}
  </section></div>;
}
