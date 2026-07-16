import { ExternalLink, Target } from "lucide-react";
import { Alert } from "../../types";

function safeMitreUrl(alert: Alert) {
  const value = alert.mitre?.url;
  if (value) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol === "https:" && parsed.hostname === "attack.mitre.org") return parsed.toString();
    } catch {
      return null;
    }
  }
  const id = alert.mitre?.techniqueId;
  if (!id || id === "T0000") return null;
  return `https://attack.mitre.org/techniques/${encodeURIComponent(id.replace(".", "/"))}/`;
}

export function MitreAttackPanel({ alert }: { alert: Alert }) {
  const url = safeMitreUrl(alert);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><span className="block text-[8px] font-black uppercase tracking-widest text-muted-foreground">MITRE ATT&CK mapping</span><h3 className="mt-1 text-[10px] font-black uppercase text-cyan-500">Backend-provided technique</h3></div>
        <Target size={14} className="text-cyan-500" />
      </div>
      <div className="rounded-xl border border-border bg-secondary/15 p-4">
        <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3">
          <div className="space-y-2">
            <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 font-mono text-[9px] font-black text-cyan-500">{alert.mitre?.techniqueId || "Not mapped"}</span>
            <h4 className="text-sm font-black text-foreground">{alert.mitre?.techniqueName || "Technique not supplied"}</h4>
            <p className="text-[10px] uppercase text-muted-foreground">Tactic: {alert.mitre?.tactic || "Not supplied"}</p>
          </div>
          {url && <a href={url} target="_blank" rel="noreferrer" className="rounded border border-border p-2 text-muted-foreground hover:text-foreground" title="Open official MITRE ATT&CK page"><ExternalLink size={13} /></a>}
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">This panel displays only the mapping attached to alert <span className="font-mono text-foreground">{alert.id}</span>; it does not infer a technique from the attack label.</p>
      </div>
    </div>
  );
}

export default MitreAttackPanel;
