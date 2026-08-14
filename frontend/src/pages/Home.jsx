import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getCourses, createCourse } from "../services/courseService";
import CourseFormModal from "../components/CourseFormModal";
import Toast from "../components/Toast";
import AppShell from "../components/layout/AppShell";
import Icon from "../components/ui/Icon";

const DEMO_COURSES = [
  {_id:"demo-ai",title:"Artificial Intelligence Foundations",audience:"University students",duration:"8 weeks",difficulty:"Intermediate",createdAt:"2026-08-12",syllabus:Array(8).fill({})},
  {_id:"demo-web",title:"Modern Web Development",audience:"Aspiring developers",duration:"6 weeks",difficulty:"Beginner",createdAt:"2026-08-09",syllabus:Array(6).fill({})},
  {_id:"demo-data",title:"Data Structures & Algorithms",audience:"Computer science learners",duration:"10 weeks",difficulty:"Advanced",createdAt:"2026-08-04",syllabus:Array(10).fill({})}
];
const levelClass = value => `level-pill ${String(value || "adaptive").toLowerCase()}`;

function ProductPreview({ name, courseCount, modules }) {
  return <div className="hero-visual" aria-hidden="true"><div className="visual-shape"/><div className="visual-accent"/><div className="product-window">
    <div className="window-bar"><span/><span/><span/><strong>SmartSyllabusAI</strong><i>AI ONLINE</i></div>
    <div className="window-body"><aside><b/><i className="active"/><i/><i/><i/></aside><section>
      <small>WORKSPACE OVERVIEW</small><h3>Good morning, {name}.</h3>
      <div className="preview-metrics"><div><span>COURSES</span><strong>{courseCount}</strong></div><div><span>MODULES</span><strong>{modules}</strong></div><div><span>STATUS</span><strong>Ready</strong></div></div>
      <div className="preview-generator"><span>AI COURSE GENERATOR</span><strong>What do you want to learn?</strong><div>Try “Product design systems” <b>Generate ✦</b></div></div>
      <div className="preview-courses"><div><i/><strong>Machine Learning Foundations</strong><span>8 weeks · Intermediate</span></div><div><i/><strong>Modern Product Design</strong><span>6 weeks · Beginner</span></div></div>
    </section></div>
  </div></div>;
}

function CourseCard({ course, onOpen }) {
  return <article className="modern-course-card"><div className="course-card-head"><span className="ai-course-label"><Icon name="spark" size={12}/>AI course</span><span className={levelClass(course.difficulty)}>{course.difficulty || "Adaptive"}</span></div><h3>{course.title}</h3><p>{course.audience ? `Designed for ${course.audience}.` : "A structured learning path with editable material and assessments."}</p><div className="course-card-meta"><span><Icon name="clock" size={14}/>{course.duration || "Self paced"}</span><span>{course.syllabus?.length || 0} modules</span></div><button onClick={onOpen}>Open course <Icon name="arrow" size={15}/></button></article>;
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses,setCourses]=useState([]); const [loading,setLoading]=useState(true); const [modal,setModal]=useState(false); const [generating,setGenerating]=useState(false); const [error,setError]=useState(""); const [success,setSuccess]=useState("");
  const firstName=user?.displayName?.split(" ")[0]||user?.email?.split("@")[0]||"Learner";
  const refresh=async()=>{const data=await getCourses();setCourses(data.courses||[])};
  useEffect(()=>{if(!user?.email)return;if(user.isDemo){queueMicrotask(()=>{setCourses(DEMO_COURSES);setLoading(false)});return}let mounted=true;getCourses().then(d=>mounted&&setCourses(d.courses||[])).catch(()=>mounted&&setError("Your course library could not be reached. Check the API connection and try again.")).finally(()=>mounted&&setLoading(false));return()=>{mounted=false}},[user]);
  useEffect(()=>{const id=window.location.hash.slice(1);if(id)requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"}))},[]);
  const modules=useMemo(()=>courses.reduce((n,c)=>n+(c.syllabus?.length||0),0),[courses]);
  const create=async form=>{setGenerating(true);setError("");try{if(user.isDemo){await new Promise(resolve=>setTimeout(resolve,1600));setCourses(prev=>[{_id:`demo-${Date.now()}`,title:form.topic,audience:form.audience,duration:form.duration,difficulty:form.difficulty,createdAt:new Date().toISOString(),syllabus:Array.from({length:Math.max(4,parseInt(form.duration)||6)},()=>({}))},...prev]);setModal(false);setSuccess("The preview course was added to your library. Production accounts save the same result through the course API.");return}const data=await createCourse({...form,email:user.email});await refresh();setModal(false);setSuccess(data.isFallback?"AI capacity was limited, so a complete sample course was prepared for you.":"Your course is ready. Open it from the course library.")}catch(e){setError(e.userMessage||"Course generation did not complete. Review the details and try again.")}finally{setGenerating(false)}};
  const openCourse=course=>{if(user?.isDemo){setSuccess("This sample card demonstrates the course library. Connect Firebase and the API to open saved course data.");return}navigate(`/course/${course._id}`)};

  return <AppShell onGenerate={()=>setModal(true)}><div className="modern-home">
    <section className="modern-hero page-width"><div className="modern-hero-copy"><span className="announcement"><b>NEW</b> Curriculum engine 2.0 <i>→</i></span><h1>Learning paths,<br/><span>beautifully built.</span></h1><p>Turn one learning goal into a coherent course—with sequenced modules, focused study material, Bloom-aligned assessments and practical assignments.</p><div className="modern-hero-actions"><button className="modern-button primary" onClick={()=>setModal(true)}><Icon name="spark"/>Generate your first course</button><button className="modern-button secondary" onClick={()=>document.getElementById("product")?.scrollIntoView({behavior:"smooth"})}>See the workflow <Icon name="arrow"/></button></div><div className="hero-note"><span><i>A</i><i>K</i><i>M</i></span><p><strong>Built for deliberate learning</strong>From topic to editable curriculum in minutes.</p></div></div><ProductPreview name={firstName} courseCount={courses.length} modules={modules}/></section>

    <section className="confidence-strip"><div className="page-width"><span>One workspace for</span><strong>Syllabi</strong><strong>Study material</strong><strong>Assessments</strong><strong>Assignments</strong><strong>PDF exports</strong></div></section>

    <section className="modern-section page-width" id="product"><header className="modern-section-head"><div><span className="modern-eyebrow">One intelligent workspace</span><h2>Every part of the course has a purpose.</h2></div><p>SmartSyllabusAI connects course structure, study material and assessment design. Each output can be reviewed, edited and exported without leaving the workspace.</p></header><div className="product-bento">
      <article className="bento-card bento-blue"><span>01 · STRUCTURE</span><h3>From topic to teachable sequence</h3><p>The generator turns scope, audience and duration into a module order that builds knowledge progressively.</p><div className="workflow-steps"><div><b>1</b><strong>Define</strong><small>Topic and audience</small></div><div><b>2</b><strong>Sequence</strong><small>Modules and concepts</small></div><div><b>3</b><strong>Develop</strong><small>Material and examples</small></div><div><b>4</b><strong>Assess</strong><small>Questions and tasks</small></div></div></article>
      <article className="bento-card bento-mint" id="assessment-design"><span>02 · ASSESS</span><h3>Questions with cognitive intent</h3><p>Control marks, difficulty and Bloom's level instead of generating an undifferentiated question list.</p><div className="taxonomy-preview"><div><b>38%</b><small>Understand</small></div><div><b>27%</b><small>Apply</small></div><div><b>21%</b><small>Analyze</small></div><div><b>14%</b><small>Evaluate</small></div></div></article>
      <article className="bento-card bento-dark"><div><span>03 · REUSE</span><h3>Your learning library stays editable.</h3><p>Update generated content, revisit earlier courses and export materials when they are ready to share.</p></div><div className="library-preview"><div><span>BEGINNER</span><strong>Modern Web Development</strong><small>6 weeks · 12 modules</small><i><b style={{width:"72%"}}/></i></div><div><span>INTERMEDIATE</span><strong>Artificial Intelligence</strong><small>8 weeks · 18 modules</small><i><b style={{width:"48%"}}/></i></div><div><span>ADVANCED</span><strong>Data Structures</strong><small>10 weeks · 20 modules</small><i><b style={{width:"86%"}}/></i></div></div></article>
    </div></section>

    <section className="course-library page-width" id="courses"><header><div><span className="modern-eyebrow">Your knowledge library</span><h2>Continue learning</h2></div><button className="modern-button dark" onClick={()=>setModal(true)}><Icon name="plus"/>New course</button></header>{loading?<div className="modern-course-grid">{[1,2,3].map(i=><div className="modern-course-card modern-skeleton" key={i}/>)}</div>:courses.length?<div className="modern-course-grid">{courses.map(c=><CourseCard key={c._id} course={c} onOpen={()=>openCourse(c)}/>)}</div>:<div className="modern-empty"><span><Icon name="book" size={25}/></span><h3>Build your first learning path</h3><p>Your generated courses will appear here with their modules, material and assessment history.</p><button className="modern-button primary" onClick={()=>setModal(true)}>Create a course</button></div>}</section>

    <section className="guide-section page-width" id="learning-guide"><div><span className="modern-eyebrow">A focused workflow</span><h2>Start with a precise learning goal.</h2><p>Strong inputs produce useful curricula. Name the topic, identify who is learning, choose a realistic duration and set the starting difficulty.</p><button className="modern-button primary" onClick={()=>setModal(true)}>Define my course <Icon name="arrow"/></button></div><ol><li><b>01</b><span><strong>Describe the outcome</strong><small>Use a specific subject or skill, not a broad category.</small></span></li><li><b>02</b><span><strong>Set learner context</strong><small>Audience and difficulty determine depth, language and examples.</small></span></li><li><b>03</b><span><strong>Review before exporting</strong><small>Edit generated material, then create assessments and assignments.</small></span></li></ol></section>

    <section className="final-cta page-width"><h2>Turn the next topic into a course worth completing.</h2><button className="modern-button white" onClick={()=>setModal(true)}>Build a course <Icon name="arrow"/></button></section>
  </div>{modal&&<CourseFormModal onClose={()=>setModal(false)} onSubmit={create} loading={generating}/>}<Toast message={error} type="error" onDismiss={()=>setError("")}/><Toast message={success} type="success" onDismiss={()=>setSuccess("")}/></AppShell>;
}
