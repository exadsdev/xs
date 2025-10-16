"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [schedules, setSchedules] = useState([]);

  async function fetchData() {
    const res = await fetch("/api/schedules");
    const json = await res.json();
    if (json.ok) setSchedules(json.data);
  }

  useEffect(() => { fetchData(); }, []);

  async function toggleActive(id, isActive) {
    await fetch(`/api/schedules/${id}`, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ isActive })
    });
    fetchData();
  }

  return (
    <div className="container">
      <h1>Admin · Schedules</h1>
      <table className="table card">
        <thead>
          <tr>
            <th>Title</th>
            <th>Destination</th>
            <th>Next Run</th>
            <th>Status</th>
            <th>Toggle</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(s => (
            <tr key={s.id}>
              <td>{s.title}</td>
              <td>{s.destination?.name} ({s.destination?.type})</td>
              <td>{new Date(s.nextRunAt).toLocaleString()}</td>
              <td><span className="badge">{s.isActive ? "ACTIVE" : "PAUSED"}</span></td>
              <td>
                <button className="button"
                        onClick={()=>toggleActive(s.id, !s.isActive)}>
                  {s.isActive ? "Pause" : "Resume"}
                </button>
              </td>
            </tr>
          ))}
          {!schedules.length && (
            <tr><td colSpan={5}>ยังไม่มีรายการ</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
