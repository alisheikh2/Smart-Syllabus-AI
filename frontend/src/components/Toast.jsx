import { useEffect, useRef } from "react";
import Icon from "./ui/Icon";

export default function Toast({message,type="error",onDismiss}){
 const ref=useRef(onDismiss); useEffect(()=>{ref.current=onDismiss}); useEffect(()=>{if(!message)return;const t=setTimeout(()=>ref.current?.(),5000);return()=>clearTimeout(t)},[message]); if(!message)return null;
 const meta={success:{icon:"check",label:"Success"},error:{icon:"close",label:"Something went wrong"},warning:{icon:"clock",label:"Attention"},info:{icon:"spark",label:"Update"}}[type]||{icon:"spark",label:"Update"};
 return <div className={`toast toast-${type}`} role={type==="error"?"alert":"status"} aria-live="polite"><span className="toast-icon"><Icon name={meta.icon} size={15}/></span><div><strong>{meta.label}</strong><p>{message}</p></div><button aria-label="Dismiss notification" onClick={()=>ref.current?.()}><Icon name="close" size={15}/></button><i className="toast-progress"/></div>;
}
