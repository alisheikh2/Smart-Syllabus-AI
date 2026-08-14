import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getCourses } from "../services/courseService";
import { getAssessmentsByCourse } from "../services/assessmentService";
import { getAssignmentsByCourse } from "../services/assignmentService";
import AppShell from "../components/layout/AppShell";
import Icon from "../components/ui/Icon";

const DEMO_ANALYTICS = {
  courses: [
    {_id:"a",title:"Artificial Intelligence Foundations",difficulty:"Intermediate",createdAt:"2026-06-10",syllabus:Array(18).fill({})},
    {_id:"b",title:"Modern Web Development",difficulty:"Beginner",createdAt:"2026-07-08",syllabus:Array(12).fill({})},
    {_id:"c",title:"Data Structures & Algorithms",difficulty:"Advanced",createdAt:"2026-08-04",syllabus:Array(20).fill({})}
  ],
  assessments: [
    {_id:"x",mcqs:Array(12).fill({bloomLevel:"Understanding"}),shortQuestions:Array(6).fill({bloomLevel:"Application"}),longQuestions:Array(3).fill({bloomLevel:"Analysis"})},
    {_id:"y",mcqs:Array(10).fill({bloomLevel:"Knowledge"}),shortQuestions:Array(5).fill({bloomLevel:"Application"}),longQuestions:Array(2).fill({bloomLevel:"Evaluation"})}
  ],
  assignments: [{_id:"m"},{_id:"n"},{_id:"o"}]
};

function Metric({icon,label,value,note}){return <article className="analytics-metric"><span><Icon name={icon}/></span><p>{label}</p><strong>{value}</strong><small>{note}</small></article>}
function Bar({label,value,max,color="var(--primary)"}){const pct=max?Math.max(3,Math.round(value/max*100)):0;return <div className="data-bar"><div><span>{label}</span><strong>{value}</strong></div><i><b style={{width:`${pct}%`,background:color}}/></i></div>}
function AnalyticsSkeleton(){return <div className="analytics-page"><div className="page-title skeleton-line"/><div className="analytics-kpis">{[1,2,3,4].map(i=><div className="analytics-metric skeleton-card" key={i}/>)}</div><div className="analytics-grid">{[1,2,3,4].map(i=><div className="chart-card skeleton-card" key={i}/>)}</div></div>}

export default function Analytics(){
 const {user}=useAuth(); const [courses,setCourses]=useState([]); const [assessments,setAssessments]=useState([]); const [assignments,setAssignments]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 useEffect(()=>{if(!user?.email)return;if(user.isDemo){queueMicrotask(()=>{setCourses(DEMO_ANALYTICS.courses);setAssessments(DEMO_ANALYTICS.assessments);setAssignments(DEMO_ANALYTICS.assignments);setLoading(false)});return}let mounted=true;(async()=>{try{const c=(await getCourses()).courses||[];if(!mounted)return;setCourses(c);const [ar,gr]=await Promise.all([Promise.allSettled(c.map(x=>getAssessmentsByCourse(x._id))),Promise.allSettled(c.map(x=>getAssignmentsByCourse(x._id)))]);if(mounted){setAssessments(ar.flatMap(r=>r.status==="fulfilled"?(r.value.assessments||[]):[]));setAssignments(gr.flatMap(r=>r.status==="fulfilled"?(r.value.assignments||[]):[]))}}catch{if(mounted)setError("Analytics are temporarily unavailable. Your course data is safe.")}finally{if(mounted)setLoading(false)}})();return()=>{mounted=false}},[user]);
 const data=useMemo(()=>{const q=assessments.reduce((n,a)=>n+(a.mcqs?.length||0)+(a.shortQuestions?.length||0)+(a.longQuestions?.length||0),0);const types=assessments.reduce((o,a)=>({mcq:o.mcq+(a.mcqs?.length||0),short:o.short+(a.shortQuestions?.length||0),long:o.long+(a.longQuestions?.length||0)}),{mcq:0,short:0,long:0});const diff=courses.reduce((o,c)=>({...o,[c.difficulty||"Unknown"]:(o[c.difficulty||"Unknown"]||0)+1}),{});const bloom={};assessments.forEach(a=>[...(a.mcqs||[]),...(a.shortQuestions||[]),...(a.longQuestions||[])].forEach(x=>{if(x.bloomLevel)bloom[x.bloomLevel]=(bloom[x.bloomLevel]||0)+1}));const months={};courses.forEach(c=>{const d=new Date(c.createdAt);const k=d.toLocaleDateString("en-US",{month:"short"});months[k]=(months[k]||0)+1});return{q,types,diff,bloom,months}},[courses,assessments]);
 if(loading)return <AppShell><AnalyticsSkeleton/></AppShell>;
 return <AppShell><div className="analytics-page"><header className="page-heading"><div><span className="section-kicker">Learning intelligence</span><h1>Analytics</h1><p>Understand your content library and generation activity at a glance.</p></div><span className="live-status"><i/>Live workspace data</span></header>
 {error&&<div className="error-banner" role="alert">{error}</div>}
 <section className="analytics-kpis"><Metric icon="book" label="Courses generated" value={courses.length} note="Complete learning paths"/><Metric icon="file" label="Assessments" value={assessments.length} note={`${data.q} total questions`}/><Metric icon="layers" label="Assignments" value={assignments.length} note="Applied learning tasks"/><Metric icon="spark" label="Content volume" value={courses.reduce((n,c)=>n+(c.syllabus?.length||0),0)} note="Structured modules"/></section>
 <section className="analytics-grid">
  <article className="chart-card wide"><div className="chart-heading"><div><span className="section-kicker">Generation trend</span><h2>Course activity</h2></div><span>All time</span></div><div className="column-chart">{Object.keys(data.months).length?Object.entries(data.months).map(([m,v])=><div key={m}><span title={`${v} courses`} style={{height:`${Math.max(16,v/Math.max(...Object.values(data.months))*100)}%`}}/><small>{m}</small></div>):<p className="no-data">Generate courses to see activity over time.</p>}</div></article>
  <article className="chart-card"><div className="chart-heading"><div><span className="section-kicker">Course mix</span><h2>Difficulty</h2></div></div><div className="bar-list">{Object.entries(data.diff).map(([k,v])=><Bar key={k} label={k} value={v} max={courses.length} color={k==="Beginner"?"var(--success)":k==="Advanced"?"var(--danger)":"var(--warning)"}/>)}{!courses.length&&<p className="no-data">No course data yet.</p>}</div></article>
  <article className="chart-card"><div className="chart-heading"><div><span className="section-kicker">Assessment design</span><h2>Question distribution</h2></div></div><div className="bar-list"><Bar label="Multiple choice" value={data.types.mcq} max={Math.max(...Object.values(data.types),1)}/><Bar label="Short answer" value={data.types.short} max={Math.max(...Object.values(data.types),1)} color="var(--cyan)"/><Bar label="Long answer" value={data.types.long} max={Math.max(...Object.values(data.types),1)} color="var(--blue)"/></div></article>
  <article className="chart-card wide"><div className="chart-heading"><div><span className="section-kicker">Cognitive depth</span><h2>Bloom's Taxonomy</h2></div></div><div className="taxonomy-grid">{Object.entries(data.bloom).length?Object.entries(data.bloom).sort((a,b)=>b[1]-a[1]).map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong><small>questions</small></div>):<p className="no-data">Generate an assessment to unlock taxonomy insights.</p>}</div></article>
 </section></div></AppShell>;
}
