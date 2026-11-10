import { Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Coins, Headphones, Pause, Play, RotateCcw, ShoppingBag, Volume2, VolumeX, Zap } from "lucide-react";

type Props = {
  score: number; distance: number; speed: number; shillings: number; chaser: number; paused: boolean; gameOver: boolean;
  soundOn: boolean; onPause: () => void; onRestart: () => void; onSound: () => void; onShop: () => void;
};

const fmt = (n: number) => Math.floor(n).toLocaleString("en-US");

export default function GameHUD({ score, distance, speed, shillings, chaser, paused, gameOver, soundOn, onPause, onRestart, onSound, onShop }: Props) {
  const threat = Math.max(8, Math.min(100, 100 - chaser * 1.4));
  const warning = chaser < 30;
  return <div className="game-hud">
    <header className="topbar">
      <div className="brand-lockup">
        <div className="brand-mark"><span className="brand-lines">MR</span><span className="brand-spark" /></div>
        <div><div className="brand-title">MATATU <span>RUSH</span></div><div className="brand-sub">APEX ESCAPE <i>•</i> NAIROBI CIRCUIT</div></div>
      </div>
      <div className="engine-status"><span className="live-dot" /> ENGINE: 60 FPS STABLE</div>
      <div className="header-actions">
        <button className="icon-button" onClick={onSound} aria-label={soundOn ? "Mute sound" : "Enable sound"} title={soundOn ? "Mute" : "Sound on"}>{soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
        <button className="icon-button shop-button" onClick={onShop} aria-label="Open loadout shop" title="Loadout"><ShoppingBag size={17} /><span>LOADOUT</span></button>
        <button className="icon-button" onClick={onRestart} aria-label="Restart run" title="Restart"><RotateCcw size={17} /></button>
        <button className="icon-button pause-button" onClick={onPause} aria-label={paused ? "Resume run" : "Pause run"} title={paused ? "Resume" : "Pause"}>{paused ? <Play size={17} /> : <Pause size={17} />}</button>
      </div>
    </header>

    <div className="hud-stats">
      <div className="stat-card score-card"><span className="stat-label">RUN SCORE</span><strong>{fmt(score)}</strong><small><Activity size={12} /> BEST RUN <b>2,840</b></small></div>
      <div className="stat-card distance-card"><span className="stat-label">DISTANCE</span><strong>{fmt(distance)}<em>m</em></strong><small>RIVER ROAD <b>→</b> CBD</small></div>
      <div className="stat-card speed-card"><span className="stat-label">SPEED MULTIPLIER</span><strong>{speed.toFixed(1)}<em>x</em></strong><small><Zap size={12} /> FULL THROTTLE</small></div>
      <div className="stat-card coin-card"><span className="stat-label">SHILLINGS</span><strong><Coins size={20} /> {fmt(shillings)}</strong><small>COLLECT & UPGRADE</small></div>
    </div>

    <div className={`chaser-card ${warning ? "is-warning" : ""}`}>
      <div className="chaser-head"><div className="chaser-title"><span className="alert-pulse" /> MATATU CHASER <small>PROXIMITY</small></div><b>{Math.round(chaser)}<i>m</i></b></div>
      <div className="threat-track"><div className="threat-fill" style={{ width: `${threat}%` }} /></div>
      <div className="chaser-foot"><span>KEEP MOVING. DON'T LOOK BACK.</span><span className="alert-text">{warning ? "DANGER ZONE" : "ENGINE CLOSING"}</span></div>
    </div>

    <div className="control-hint"><span><kbd><ArrowLeft size={12} /></kbd><kbd><ArrowRight size={12} /></kbd> CHANGE LANE</span><i /> <span><kbd><ArrowUp size={12} /></kbd> JUMP</span><i /> <span><kbd><ArrowDown size={12} /></kbd> SLIDE</span></div>
    <button className="audio-quick" onClick={onSound}><Headphones size={15} /> {soundOn ? "SOUND ON" : "SOUND OFF"}</button>

    {(paused || gameOver) && <div className="game-overlay">
      <div className="overlay-card"><div className="overlay-kicker">{gameOver ? "RUN ENDED" : "PAUSED"}</div><h2>{gameOver ? "The streets got you." : "Take a breather."}</h2><p>{gameOver ? `You made it ${fmt(distance)} meters and banked ${fmt(shillings)} shillings.` : "Your run is frozen. The chaser is waiting."}</p>
        <div className="overlay-buttons"><button className="primary-button" onClick={gameOver ? onRestart : onPause}>{gameOver ? <RotateCcw size={16} /> : <Play size={16} />}{gameOver ? "RUN IT BACK" : "RESUME RUN"}</button><button className="quiet-button" onClick={onRestart}><RotateCcw size={15} /> RESTART</button></div>
      </div>
    </div>}
  </div>;
}
