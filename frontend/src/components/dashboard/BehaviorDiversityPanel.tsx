import React, { useState, useEffect } from "react";
import { Users2, ArrowUpDown, Globe2, ShieldCheck, Activity } from "lucide-react";
import { cn } from "../../lib/utils";

interface UserActivity {
  id: string;
  name: string;
  role: string;
  search: string;
  download: string;
  upload: string;
  ssh: string;
  api: string;
  status: string;
}

export function BehaviorDiversityPanel() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(t => t + 1);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const baseActivities: UserActivity[] = [
    { id: "UserA", name: "User A (Simulated Dev)", role: "Developer Cluster", search: "84 queries", download: "4.1 GB", upload: "1.2 GB", ssh: "High Frequency", api: "840 ops/hr", status: "Active Coding" },
    { id: "UserB", name: "User B (Simulated HR)", role: "HR Operations", search: "194 queries", download: "520 MB", upload: "40 MB", ssh: "No Activity", api: "12 ops/hr", status: "Submitting Forms" },
    { id: "UserC", name: "User C (Corporate Admin)", role: "System Administrator", search: "42 queries", download: "11.2 GB", upload: "8.9 GB", ssh: "High Frequency", api: "120 ops/hr", status: "File Synchronization" },
    { id: "UserD", name: "User D (Design Agency)", role: "Graphics Specialist", search: "12 queries", download: "24.5 GB", upload: "22.2 GB", ssh: "No Activity", api: "42 ops/hr", status: "FTP Streaming" },
    { id: "UserE", name: "User E (External Client)", role: "Partner Contractor", search: "20 queries", download: "110 MB", upload: "800 MB", ssh: "Low Frequency", api: "1900 ops/hr", status: "REST Inbound Pulls" }
  ];

  // Randomize a small tail metric for interactivity
  const getDynamicApi = (id: string, base: string) => {
    const val = parseInt(base);
    const added = Math.sin(ticks + id.charCodeAt(0)) * 25;
    return `${Math.floor(val + added)} ops/hr`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Users2 className="w-4 h-4 text-cyan-400 animate-pulse" />
          SECTION 34: ENHANCED ENTERPRISE COMPLEX USER BEHAVIORAL DIVERSITY REPORTING
        </h3>
        <span className="text-[7.2px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          USER CLUSTER VECTORS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3">
        {baseActivities.map((user) => {
          const apiOps = getDynamicApi(user.id, user.api);
          const isSshActive = user.ssh !== "No Activity";

          return (
            <div key={user.id} className="bg-secondary/40 border border-border/70 rounded-xl p-3 flex flex-col justify-between font-mono hover:border-cyan-500/20 transition-all min-w-0 overflow-hidden wrap-break-word">
              <div className="border-b border-border/10 pb-2 mb-2 leading-none">
                <span className="text-[9.5px] font-black text-foreground block">{user.name}</span>
                <span className="text-[6.5px] text-muted-foreground mt-1 block uppercase font-bold">{user.role}</span>
              </div>

              <div className="space-y-1.5 text-[8px] leading-tight my-1.5 flex-1">
                <div className="flex justify-between border-b border-border/5 pb-1">
                  <span className="text-muted-foreground">WEB SEARCHES:</span>
                  <span className="text-foreground font-black">{user.search}</span>
                </div>
                <div className="flex justify-between border-b border-border/5 pb-1">
                  <span className="text-muted-foreground">DOWNLOAD VOL:</span>
                  <span className="text-cyan-400 font-extrabold">{user.download}</span>
                </div>
                <div className="flex justify-between border-b border-border/5 pb-1">
                  <span className="text-muted-foreground">UPLOAD VOL:</span>
                  <span className="text-foreground font-black">{user.upload}</span>
                </div>
                <div className="flex justify-between border-b border-border/5 pb-1">
                  <span className="text-muted-foreground">SSH CRYPT:</span>
                  <span className={cn("font-bold", isSshActive ? "text-cyan-400 font-extrabold" : "text-muted-foreground opacity-60")}>
                    {user.ssh}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/5 pb-1">
                  <span className="text-muted-foreground">API TELEMETRY:</span>
                  <span className="text-foreground font-black">{apiOps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">STATE MACHINE:</span>
                  <span className="text-emerald-500 font-extrabold">{user.status}</span>
                </div>
              </div>

              {/* Graphical mini profile visualization */}
              <div className="pt-2 border-t border-border/5 flex items-center justify-between text-[6.5px] uppercase font-black text-muted-foreground leading-none">
                <span>SIMULATED AGENT</span>
                <span className="text-emerald-500 font-black">ENT_BASELINE</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BehaviorDiversityPanel;
