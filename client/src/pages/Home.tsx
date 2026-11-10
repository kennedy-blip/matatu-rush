import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BadgeCheck, ChevronRight, Coins, MapPin, Pause, Shield, Sparkles, Trophy, Zap } from "lucide-react";
import RunnerCanvas from "@/components/game/RunnerCanvas";
import GameHUD from "@/components/game/GameHUD";
import LoadoutShop from "@/components/game/LoadoutShop";
import AudioController from "@/components/game/AudioController";

type Status = "running" | "paused" | "over";
type Obstacle = { at: number; lane: number; kind: "crate" | "laundry" | "drain" | "boda" };
const obstacles: Obstacle[] = [
  { at: 24, lane: 1, kind: "crate" }, { at: 43, lane: 0, kind: "drain" }, { at: 61, lane: 2, kind: "laundry" }, { at: 79, lane: 1, kind: "boda" }, { at: 98, lane: 0, kind: "crate" }, { at: 117, lane: 2, kind: "drain" }, { at: 137, lane: 1, kind: "laundry" }, { at: 155, lane: 0, kind: "boda" }, { at: 174, lane: 2, kind: "crate" }, { at: 192, lane: 1, kind: "drain" }, { at: 211, lane: 0, kind: "laundry" }, { at: 229, lane: 2, kind: "boda" }, { at: 247, lane: 1, kind: "crate" }, { at: 265, lane: 0, kind: "drain" }, { at: 284, lane: 2, kind: "laundry" }, { at: 302, lane: 1, kind: "boda" }, { at: 321, lane: 0, kind: "crate" }, { at: 339, lane: 2, kind: "drain" },
];
const moneyFormat = (n: number) => Math.floor(n).toLocaleString("en-US");
const readStoredList = (key: string, fallback: string[]) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : fallback;
  } catch { return fallback; }
};

export default function Home() {
  const [status, setStatus] = useState<Status>("running");
  const statusRef = useRef(status); statusRef.current = status;
  const [lane, setLane] = useState(1);
  const laneRef = useRef(lane); laneRef.current = lane;
  const [distance, setDistance] = useState(0);
  const distanceRef = useRef(0);
  const [score, setScore] = useState(0);
  const [shillings, setShillings] = useState(() => Number(localStorage.getItem("mr_wallet") || 0));
  const walletRef = useRef(shillings);
  walletRef.current = shillings;
  const [chaser, setChaser] = useState(76);
  const [shields, setShields] = useState(3);
  const [jumping, setJumping] = useState(false);
  const [sliding, setSliding] = useState(false);
  const jumpUntil = useRef(0);
  const slideUntil = useRef(0);
  const lastHit = useRef(-10);
  const lastCoin = useRef(0);
  const [soundOn, setSoundOn] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [outfit, setOutfit] = useState(() => localStorage.getItem("mr_outfit") || "Canal Sprinter");
  const [unlocked, setUnlocked] = useState(() => readStoredList("mr_unlocked", ["Canal Sprinter"]));
  const [ownedUpgrades, setOwnedUpgrades] = useState(() => readStoredList("mr_upgrades", []));
  const [best, setBest] = useState(() => Number(localStorage.getItem("mr_best") || 0));
  const bestRef = useRef(best); bestRef.current = best;
  const [toast, setToast] = useState("");
  const touchOrigin = useRef<{ x: number; y: number } | null>(null);
  const laneRefCurrent = useRef(lane); laneRefCurrent.current = lane;

  useEffect(() => {
    localStorage.setItem("mr_wallet", String(shillings));
    localStorage.setItem("mr_outfit", outfit);
    localStorage.setItem("mr_unlocked", JSON.stringify(unlocked));
    localStorage.setItem("mr_upgrades", JSON.stringify(ownedUpgrades));
  }, [shillings, outfit, unlocked, ownedUpgrades]);

  const resetRun = useCallback(() => {
    setDistance(0); distanceRef.current = 0; setScore(0); setChaser(76); setShields(3); setLane(1); laneRef.current = 1;
    setJumping(false); setSliding(false); jumpUntil.current = 0; slideUntil.current = 0; lastHit.current = -10; lastCoin.current = 0; setStatus("running");
  }, []);
  const moveLane = useCallback((direction: number) => { if (statusRef.current === "running") setLane((current) => Math.max(0, Math.min(2, current + direction))); }, []);
  const jump = useCallback(() => { if (statusRef.current !== "running") return; const now = performance.now(); if (now < jumpUntil.current && !ownedUpgrades.includes("spring")) return; jumpUntil.current = now + (ownedUpgrades.includes("spring") ? 840 : 630); setJumping(true); setSliding(false); }, [ownedUpgrades]);
  const slide = useCallback(() => { if (statusRef.current !== "running") return; slideUntil.current = performance.now() + (ownedUpgrades.includes("slide") ? 1050 : 780); setSliding(true); setJumping(false); }, [ownedUpgrades]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault();
      if (event.repeat) return;
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") moveLane(-1);
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") moveLane(1);
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w" || event.key === " ") jump();
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") slide();
      if (event.key.toLowerCase() === "p" || event.key === "Escape") setStatus((s) => s === "running" ? "paused" : s === "paused" ? "running" : s);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [moveLane, jump, slide]);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    let lastMeter = -1;
    const tick = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.06); previous = now;
      if (statusRef.current === "running") {
        const next = distanceRef.current + delta * (8.6 + Math.min(distanceRef.current / 90, 5.6));
        distanceRef.current = next;
        const currentMeter = Math.floor(next);
        if (currentMeter !== lastMeter) {
          lastMeter = currentMeter;
          setDistance(currentMeter);
          setScore(Math.floor(currentMeter * 12 + walletRef.current * 8));
          if (currentMeter - lastCoin.current >= 13) {
            const gained = Math.floor((currentMeter - lastCoin.current) / 13) * 4;
            walletRef.current += gained; lastCoin.current = currentMeter - ((currentMeter - lastCoin.current) % 13);
            setShillings(walletRef.current);
          }
          if (currentMeter > bestRef.current) { bestRef.current = currentMeter; setBest(currentMeter); localStorage.setItem("mr_best", String(currentMeter)); }
          setChaser((currentChaser) => Math.max(17, currentChaser + (currentMeter % 100 === 0 ? 1.5 : 0)));
        }
        if (now > jumpUntil.current && jumping) setJumping(false);
        if (now > slideUntil.current && sliding) setSliding(false);
        if (now - lastHit.current > 1050) {
          const hit = obstacles.find((o) => Math.abs(next - o.at) < delta * (8.6 + Math.min(next / 90, 5.6)) + 0.35 && o.lane === laneRefCurrent.current);
          if (hit) {
            const avoided = hit.kind === "drain" ? now < jumpUntil.current : hit.kind === "laundry" ? now < slideUntil.current : false;
            if (!avoided) {
              lastHit.current = now;
              setShields((life) => { const remaining = Math.max(0, life - 1); if (remaining === 0) { statusRef.current = "over"; setStatus("over"); } return remaining; });
              setChaser((v) => Math.max(11, v - 22));
              setToast("IMPACT! SWITCH LANES TO LOSE THE TAIL"); window.setTimeout(() => setToast(""), 1800);
            }
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [jumping, sliding]);

  const purchase = (name: string, cost: number) => {
    if (walletRef.current < cost) { setToast("NOT ENOUGH SHILLINGS — KEEP RUNNING"); window.setTimeout(() => setToast(""), 2000); return; }
    walletRef.current -= cost; setShillings(walletRef.current); setUnlocked((list) => [...list, name]); setOutfit(name); setToast(`${name.toUpperCase()} UNLOCKED`); window.setTimeout(() => setToast(""), 1800);
  };
  const buyUpgrade = (id: string, cost: number) => {
    if (walletRef.current < cost) { setToast("NOT ENOUGH SHILLINGS — KEEP RUNNING"); window.setTimeout(() => setToast(""), 2000); return; }
    walletRef.current -= cost; setShillings(walletRef.current); setOwnedUpgrades((list) => [...list, id]); setToast("UPGRADE INSTALLED"); window.setTimeout(() => setToast(""), 1800);
  };
  const stagePointerDown = (e: React.TouchEvent) => { touchOrigin.current = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }; };
  const stagePointerUp = (e: React.TouchEvent) => {
    if (!touchOrigin.current) return;
    const dx = e.changedTouches[0].clientX - touchOrigin.current.x;
    const dy = e.changedTouches[0].clientY - touchOrigin.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 28) {
      if (Math.abs(dx) > Math.abs(dy)) moveLane(dx > 0 ? 1 : -1);
      else if (dy < 0) jump(); else slide();
    }
    touchOrigin.current = null;
  };
  const currentSpeed = 8.6 + Math.min(distance / 90, 5.6);

  return <main className="game-shell">
    <div className="game-backdrop" />
    <GameHUD score={score} distance={distance} speed={currentSpeed} shillings={shillings} chaser={chaser} paused={status === "paused"} gameOver={status === "over"} soundOn={soundOn} onPause={() => setStatus((s) => s === "running" ? "paused" : s === "paused" ? "running" : s)} onRestart={resetRun} onSound={() => setSoundOn((v) => !v)} onShop={() => setShopOpen(true)} />
    <div className="main-layout">
      <section className="stage-panel" onTouchStart={stagePointerDown} onTouchEnd={stagePointerUp} aria-label="Three dimensional endless runner">
        <div className="stage-topline"><div className="route-label"><MapPin size={13} /><span>RIVER ROAD</span><i>›</i><b>CBD</b></div><div className="stage-weather"><span className="weather-sun"/> GOLDEN HOUR <i>·</i> 18:42 EAT</div><div className="stage-code">SECTOR 07 <b>///</b> {String(Math.floor(distance / 80) + 1).padStart(2, "0")}</div></div>
        <div className="canvas-window"><RunnerCanvas lane={lane} distance={distance} running={status === "running"} jumping={jumping} sliding={sliding} outfit={outfit} />
          <div className="scene-vignette" />
          <div className="scene-center-hint"><span>RUN THE LINE</span><i>DON'T LET IT CATCH YOU</i></div>
          <div className="scene-bottom-label"><span><span className="pulse-dot"/> STREET LEVEL</span><span>WET SEASON <i>•</i> 02.14 KM</span></div>
          {status === "running" && <div className="lane-indicator"><span className={lane === 0 ? "current" : ""}/><span className={lane === 1 ? "current" : ""}/><span className={lane === 2 ? "current" : ""}/></div>}
        </div>
        <div className="stage-bottomline"><div className="shield-readout"><span className="readout-label"><Shield size={13} /> STREET SENSE</span><div className="shield-pips">{[0,1,2].map((i) => <i className={i < shields ? "filled" : ""} key={i}/>)}</div><span className="shield-value">{shields}<small> / 3</small></span></div>
          <div className="run-progress"><div className="progress-head"><span>ROUTE PROGRESS</span><b>{Math.min(100, Math.floor((distance % 500) / 5))}%</b></div><div className="progress-track"><i style={{ width: `${Math.min(100, (distance % 500) / 5)}%` }} /></div></div>
          <div className="run-best"><Trophy size={15} /><span>PERSONAL BEST</span><b>{moneyFormat(best)}<small>m</small></b></div>
        </div>
        <div className="mobile-controls"><button aria-label="Move left" onClick={() => moveLane(-1)}><ArrowLeft /></button><button aria-label="Jump" onClick={jump}><ArrowUp /></button><button aria-label="Slide" onClick={slide}><ArrowDown /></button><button aria-label="Move right" onClick={() => moveLane(1)}><ArrowRight /></button></div>
        {toast && <div className="game-toast"><Sparkles size={14}/>{toast}</div>}
      </section>
      <aside className="side-rail">
        <div className="rail-card route-card"><div className="rail-title-row"><div><span className="eyebrow">LIVE ROUTE</span><h3>One wrong move.</h3></div><div className="route-index">07<span> / 12</span></div></div>
          <div className="route-preview"><div className="route-grid"><span/><span className={lane === 0 ? "lane-lit" : ""}/><span/><span className={lane === 1 ? "lane-lit" : ""}/><span/><span className={lane === 2 ? "lane-lit" : ""}/><span/><span/><span/></div><div className="route-lines"><i/><i/><i/></div><div className="route-marker"><MapPin size={13}/></div><div className="route-copy"><span>RIVER ROAD</span><b>→</b><span>CBD</span></div></div>
          <div className="route-meta"><span>OBSTACLES CLEARED</span><b>{Math.floor(distance / 18)} <small>units</small></b></div>
        </div>
        <div className="rail-card objective-card"><div className="eyebrow">RUN OBJECTIVES <span className="active-label"><i/> ACTIVE</span></div><div className="objective-row"><span className="objective-icon cyan"><Coins size={14}/></span><div><b>Collect 20 shillings</b><small>{Math.min(20, shillings)} / 20</small></div><div className="objective-meter"><i style={{ width: `${Math.min(100, shillings * 5)}%` }}/></div></div><div className="objective-row"><span className="objective-icon rust"><Zap size={14}/></span><div><b>Reach 250 meters</b><small>{Math.min(250, distance)} / 250m</small></div><div className="objective-meter"><i style={{ width: `${Math.min(100, distance / 2.5)}%` }}/></div></div></div>
        <AudioController enabled={soundOn} onToggle={() => setSoundOn((v) => !v)} />
        <div className="rail-footer"><span><BadgeCheck size={13}/> LOCAL SESSION</span><span>BUILD 0.9.6 <i>·</i> <b>KE</b></span></div>
      </aside>
    </div>
    <div className="bottom-bar"><div className="bottom-left"><span className="status-light"/> LIVE SESSION <i>·</i> {status === "running" ? "RUNNING" : status === "paused" ? "PAUSED" : "RUN COMPLETE"}</div><div className="bottom-tip">TIP <span>Jump the drains.</span> <i>Slide the laundry.</i> Keep your lane clear.</div><div className="bottom-right"><span>BUILT FOR THE STREETS</span><b>NAIROBI, KE</b></div></div>
    <LoadoutShop open={shopOpen} shillings={shillings} outfit={outfit} unlocked={unlocked} upgrades={ownedUpgrades} onClose={() => setShopOpen(false)} onSelect={setOutfit} onUnlock={purchase} onUpgrade={buyUpgrade} />
  </main>;
}
