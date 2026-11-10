import { useEffect, useState } from "react";
import { AudioLines, Bluetooth, Footprints, Radio, Volume2, VolumeX, Waves } from "lucide-react";

type Props = { enabled: boolean; onToggle: () => void; compact?: boolean };

export default function AudioController({ enabled, onToggle, compact = false }: Props) {
  const [haptics, setHaptics] = useState(true);
  const [volume, setVolume] = useState(38);
  useEffect(() => {
    if (!enabled || volume === 0) return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.value = 54;
    filter.type = "lowpass";
    filter.frequency.value = 115;
    gain.gain.value = (volume / 100) * 0.018;
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    return () => { oscillator.stop(); void context.close(); };
  }, [enabled, volume]);
  if (compact) return <button className={`sound-toggle ${enabled ? "sound-on" : ""}`} onClick={onToggle} aria-label={enabled ? "Mute game audio" : "Enable game audio"}>{enabled ? <Volume2 size={14} /> : <VolumeX size={14} />} <span>{enabled ? "AUDIO LIVE" : "AUDIO MUTED"}</span><span className="audio-bars">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ "--bar": `${14 + ((i * 17) % 25)}px`, "--delay": `${i * 0.08}s` } as React.CSSProperties} />)}</span></button>;
  return <section className="audio-panel">
    <div className="panel-topline"><div><span className="eyebrow">FIELD AUDIO</span><h3>Hear the chase.</h3></div><button className={`audio-power ${enabled ? "active" : ""}`} onClick={onToggle} aria-label={enabled ? "Mute sound" : "Enable sound"}>{enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}</button></div>
    <div className={`soundscape-visual ${enabled ? "is-playing" : ""}`}><div className="sound-wave"><AudioLines size={17} />{Array.from({ length: 26 }, (_, i) => <i key={i} style={{ "--bar": `${8 + ((i * 13 + 7) % 27)}px`, "--delay": `${i * 0.055}s` } as React.CSSProperties} />)}</div><span>{enabled ? "ENGINE + STREET AMBIENCE" : "SOUND OFF"}</span></div>
    <div className="audio-sources"><div><span className="source-icon rose"><Radio size={13} /></span><span>MATATU ENGINE</span><i className={enabled ? "signal-live" : ""} /></div><div><span className="source-icon cyan"><Footprints size={13} /></span><span>FOOTSTEPS & SPLASH</span><i className={enabled ? "signal-live" : ""} /></div><div><span className="source-icon violet"><Waves size={13} /></span><span>WIND RUSH</span><i className={enabled ? "signal-live" : ""} /></div></div>
    <label className="volume-control"><span>MASTER VOLUME</span><b>{volume}%</b><input aria-label="Master volume" type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} /></label>
    <button className={`haptics-row ${haptics ? "enabled" : ""}`} onClick={() => setHaptics(!haptics)}><Bluetooth size={14} /><span>TACTILE FEEDBACK</span><b>{haptics ? "ON" : "OFF"}</b></button>
    <div className="audio-note">Audio is synthesized locally in your browser. No external tracks or permissions needed.</div>
  </section>;
}
