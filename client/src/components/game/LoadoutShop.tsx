import { Check, ChevronRight, CircleDollarSign, Crown, Footprints, LockKeyhole, X, Zap } from "lucide-react";

type Outfit = { name: string; role: string; color: string; cost: number; tag: string };
type Upgrade = { id: string; name: string; desc: string; cost: number; icon: "jump" | "slide" };
type Props = { open: boolean; shillings: number; outfit: string; unlocked: string[]; upgrades: string[]; onClose: () => void; onSelect: (name: string) => void; onUnlock: (name: string, cost: number) => void; onUpgrade: (id: string, cost: number) => void };

const outfits: Outfit[] = [
  { name: "Canal Sprinter", role: "STREET CLASSIC", color: "#06b6d4", cost: 0, tag: "STARTER" },
  { name: "Sunset Runner", role: "GOLDEN HOUR KIT", color: "#f18042", cost: 240, tag: "RARE" },
  { name: "Night Courier", role: "AFTER DARK", color: "#9a72ff", cost: 420, tag: "EPIC" },
];
const upgrades: Upgrade[] = [
  { id: "spring", name: "Double-jump springs", desc: "Hold your airtime a little longer.", cost: 180, icon: "jump" },
  { id: "slide", name: "Kinetic slide soles", desc: "Slip under lines with extra room.", cost: 150, icon: "slide" },
];

export default function LoadoutShop({ open, shillings, outfit, unlocked, upgrades: owned, onClose, onSelect, onUnlock, onUpgrade }: Props) {
  if (!open) return null;
  return <div className="shop-scrim" onClick={onClose} role="presentation"><section className="shop-panel" onClick={(e) => e.stopPropagation()} aria-label="Loadout shop">
    <div className="shop-heading"><div><div className="eyebrow">RUNNER GARAGE <span>•</span> CUSTOMIZE</div><h2>Kit for the streets.</h2><p>Build your edge. Every upgrade carries into your next run.</p></div><button className="shop-close" onClick={onClose} aria-label="Close loadout"><X size={18} /></button></div>
    <div className="shop-balance"><CircleDollarSign size={18} /><span>YOUR WALLET</span><strong>{shillings.toLocaleString()} <small>KES</small></strong></div>
    <div className="shop-section-title"><span>01 / RUNNER FITS</span><i>3 AVAILABLE</i></div>
    <div className="outfit-list">{outfits.map((item, idx) => {
      const hasItem = unlocked.includes(item.name);
      const isSelected = outfit === item.name;
      return <article className={`outfit-card ${isSelected ? "selected" : ""}`} key={item.name}>
        <div className={`avatar-card avatar-${idx}`} style={{ "--fit": item.color } as React.CSSProperties}>
          <div className="avatar-halo"/><div className="avatar-head"/><div className="avatar-body"/><div className="avatar-leg left"/><div className="avatar-leg right"/><div className="avatar-shoe left"/><div className="avatar-shoe right"/>
          <span className="fit-stamp">{item.tag}</span>
        </div>
        <div className="outfit-info"><span className="outfit-role">{item.role}</span><h3>{item.name}</h3><p>{idx === 0 ? "Light feet, sharp instincts." : idx === 1 ? "Built to catch the last light." : "Move quiet. Leave a streak."}</p></div>
        <button className={`fit-action ${isSelected ? "active" : ""}`} disabled={isSelected} onClick={() => hasItem ? onSelect(item.name) : onUnlock(item.name, item.cost)}>{isSelected ? <><Check size={14} /> EQUIPPED</> : hasItem ? <>EQUIP <ChevronRight size={14} /></> : <><LockKeyhole size={13} /> {item.cost} KES</>}</button>
      </article>;
    })}</div>
    <div className="shop-section-title upgrade-title"><span>02 / PERFORMANCE UPGRADES</span><i>PERMANENT PERKS</i></div>
    <div className="upgrade-list">{upgrades.map((item) => {
      const has = owned.includes(item.id);
      return <div className={`upgrade-card ${has ? "bought" : ""}`} key={item.id}><div className="upgrade-icon">{item.icon === "jump" ? <Zap size={18} /> : <Footprints size={18} />}</div><div className="upgrade-copy"><h3>{item.name}{has && <span className="installed"><Check size={11} /> INSTALLED</span>}</h3><p>{item.desc}</p></div><button disabled={has} className="upgrade-buy" onClick={() => onUpgrade(item.id, item.cost)}>{has ? "OWNED" : `${item.cost} KES`}</button></div>;
    })}</div>
    <div className="shop-footer"><Crown size={14} /> Earn shillings on every run. Your best distance is saved locally.</div>
  </section></div>;
}
