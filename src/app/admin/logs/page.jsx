"use client";
import { useEffect, useState } from "react";

export default function LogsPage(){
  const [logs, setLogs] = useState([]);
  useEffect(()=>{
    (async ()=>{
      const r = await fetch("/api/logs").then(r=>r.json());
      if (r.ok) setLogs(r.data);
    })();
  },[]);
  return (
    <div className="container">
      <h1 className="h1">Post Logs</h1>
      <div className="card">
        <table className="table">
          <thead><tr><th>เวลา</th><th>สถานะ</th><th>FB Post ID</th><th>Error</th></tr></thead>
          <tbody>
            {logs.map(l=>(
              <tr key={l.id}>
                <td>{new Date(l.ranAt).toLocaleString()}</td>
                <td>{l.status}</td>
                <td>{l.fbPostId || "-"}</td>
                <td style={{color:"#b91c1c"}}>{l.error || "-"}</td>
              </tr>
            ))}
            {!logs.length && <tr><td colSpan={4}>ยังไม่มีบันทึก</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
