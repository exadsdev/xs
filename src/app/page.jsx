"use client";

import { useEffect, useState } from "react";

const EMPTY_SLOT = (i) => ({
  index: i,
  enabled: false,
  timeHHMM: "",
  message: "",
  imageUrl: "",
  linkUrl: "",
  destinationId: ""
});

export default function Home() {
  const [template, setTemplate] = useState(null);
  const [slots, setSlots] = useState(Array.from({ length: 10 }, (_, i) => EMPTY_SLOT(i + 1)));
  const [destinations, setDestinations] = useState([]);
  const [pages, setPages] = useState([]);
  const [fbReady, setFbReady] = useState(false);

  // โหลด FB SDK
  useEffect(() => {
    if (window.FB) { setFbReady(true); return; }
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FB_APP_ID,
        cookie: true,
        xfbml: false,
        version: "v20.0"
      });
      setFbReady(true);
    };
    (function (d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      const js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, []);

  // โหลด template + destinations
  useEffect(() => {
    (async () => {
      const t = await fetch("/api/daily-template").then(r => r.json());
      if (t.ok) {
        setTemplate(t.data.template);
        const arr = Array.from({ length: 10 }, (_, i) => {
          const s = t.data.slots.find(x => x.index === i + 1);
          return s ? ({
            index: s.index, enabled: s.enabled, timeHHMM: s.timeHHMM,
            message: s.message || "", imageUrl: s.imageUrl || "",
            linkUrl: s.linkUrl || "", destinationId: s.destinationId || ""
          }) : EMPTY_SLOT(i + 1);
        });
        setSlots(arr);
      }
      const d = await fetch("/api/destinations").then(r => r.json());
      if (d.ok) setDestinations(d.data);
    })();
  }, []);

  function updateSlot(idx, key, val) {
    setSlots(prev => prev.map(s => s.index === idx ? { ...s, [key]: val } : s));
  }

  async function savePlan() {
    const res = await fetch("/api/daily-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots })
    }).then(r => r.json());
    alert(res.ok ? "✅ บันทึกสำเร็จ" : `❌ ${res.error || "บันทึกไม่สำเร็จ"}`);
  }

  async function runLogin() {
    if (!window.FB) { alert("FB SDK ยังไม่พร้อม"); return; }
    if (location.protocol !== "https:") {
      alert("Facebook Login ต้องใช้งานผ่าน HTTPS เท่านั้น\nเปิด https://localhost:3000 แล้วลองใหม่");
      return;
    }
    window.FB.login(async (response) => {
      if (response.authResponse) {
        const userAccessToken = response.authResponse.accessToken;
        const res = await fetch("/api/facebook/exchange-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAccessToken })
        }).then(r => r.json());
        if (res.ok) {
          setPages(res.data || []);
          const d = await fetch("/api/destinations").then(r => r.json());
          if (d.ok) setDestinations(d.data);
        } else {
          alert("ดึงเพจไม่สำเร็จ: " + res.error);
        }
      } else {
        alert("ยกเลิกการเข้าสู่ระบบ Facebook");
      }
    }, { scope: "pages_manage_posts,pages_read_engagement,pages_show_list" });
  }

  return (
    <div className="container">
      <h1 className="h1">Facebook Daily · 10 Slots</h1>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span className="badge">โซนเวลา: Asia/Bangkok</span>
            <button className="button" onClick={runLogin}>🔗 Login with Facebook</button>
          </div>

          {pages.length > 0 && (
            <>
              <hr />
              <h3>เพจที่ดึงมาได้</h3>
              <table className="table">
                <thead><tr><th>ชื่อเพจ</th><th>Page ID</th></tr></thead>
                <tbody>
                  {pages.map(p => (
                    <tr key={p.id}><td>{p.name}</td><td>{p.id}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <hr />
          <h3>ปลายทางที่บันทึกแล้ว</h3>
          <table className="table">
            <thead><tr><th>ชื่อ</th><th>ประเภท</th><th>FB ID</th></tr></thead>
            <tbody>
              {destinations.map(d => (
                <tr key={d.id}><td>{d.name}</td><td>{d.type}</td><td>{d.fbId}</td></tr>
              ))}
              {!destinations.length && <tr><td colSpan={3}>ยังไม่มีปลายทาง</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>ตั้งค่า “วันละไม่เกิน 10 โพสต์”</h2>
          <div className="grid">
            {slots.map(s => (
              <div key={s.index} className="slot">
                <h3>ช่องที่ {s.index}</h3>
                <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input type="checkbox"
                         checked={s.enabled}
                         onChange={e => updateSlot(s.index, "enabled", e.target.checked)} />
                  เปิดใช้งานช่องนี้
                </label>

                <div className="row" style={{ marginTop: 8 }}>
                  <div>
                    <label>เวลา (HH:MM)</label>
                    <input className="input" placeholder="09:00"
                           value={s.timeHHMM}
                           onChange={e => updateSlot(s.index, "timeHHMM", e.target.value)} />
                  </div>
                  <div>
                    <label>ปลายทาง</label>
                    <select className="input"
                            value={s.destinationId}
                            onChange={e => updateSlot(s.index, "destinationId", e.target.value)}>
                      <option value="">— เลือก —</option>
                      {destinations.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <label>ข้อความโพสต์</label>
                  <textarea rows={3} className="input"
                            value={s.message}
                            onChange={e => updateSlot(s.index, "message", e.target.value)} />
                </div>

                <div className="row" style={{ marginTop: 8 }}>
                  <div>
                    <label>รูปภาพ (URL)</label>
                    <input className="input"
                           value={s.imageUrl}
                           onChange={e => updateSlot(s.index, "imageUrl", e.target.value)} />
                  </div>
                  <div>
                    <label>ลิงก์แนบ</label>
                    <input className="input"
                           value={s.linkUrl}
                           onChange={e => updateSlot(s.index, "linkUrl", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="button" onClick={savePlan}>💾 บันทึก 10 ช่องวันนี้</button>
            <a className="button secondary" style={{ marginLeft: 8 }} href="/admin/logs">ดู Logs</a>
          </div>
        </div>
      </div>
    </div>
  );
}
