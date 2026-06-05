import React from "react";
import { BellRing, ShieldAlert, Radio, Clock, ToggleLeft, ToggleRight } from "lucide-react";

interface AlertSettingsTabProps {
  data: {
    alertColors: {
      Critical: string;
      High: string;
      Medium: string;
      Low: string;
    };
    alertSounds: {
      Critical: boolean;
      High: boolean;
      Medium: boolean;
      Low: boolean;
    };
    alertNotifications: {
      Critical: boolean;
      High: boolean;
      Medium: boolean;
      Low: boolean;
    };
    alertRetention: "7 Days" | "30 Days" | "90 Days" | "180 Days";
    alertAutoClose: boolean;
    alertAutoCloseDuration: "1h" | "6h" | "24h";
  };
  onChange: (path: string, value: any) => void;
  onToast: (msg: string, type?: "success" | "warning" | "info") => void;
}

export function AlertSettingsTab({ data, onChange, onToast }: AlertSettingsTabProps) {
  const severities: Array<"Critical" | "High" | "Medium" | "Low"> = ["Critical", "High", "Medium", "Low"];

  const handleColorChange = (sev: "Critical" | "High" | "Medium" | "Low", hex: string) => {
    onChange(`alertColors.${sev}`, hex);
  };

  const handleSoundToggle = (sev: "Critical" | "High" | "Medium" | "Low") => {
    const current = data.alertSounds[sev];
    onChange(`alertSounds.${sev}`, !current);
    onToast(`${sev.toUpperCase()} TELEMETRY AUDIO CHANNELS ${!current ? 'ENABLED' : 'MUTED'}`, "info");
  };

  const handleNotificationToggle = (sev: "Critical" | "High" | "Medium" | "Low") => {
    const current = data.alertNotifications[sev];
    onChange(`alertNotifications.${sev}`, !current);
    onToast(`DESKTOP NOTIFICATIONS FOR ${sev.toUpperCase()} SET TO ${!current ? 'ACTIVE' : 'INACTIVE'}`, "success");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Tab Header */}
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          <BellRing className="w-4 h-4 text-cyan-500 animate-pulse" />
          Alert Response Policy Management
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-normal">
          Customize active severity colors, allocate signal notifications, mute audios, and define log retention strategies
        </p>
      </div>

      {/* SEVERITY SETTINGS */}
      <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4">
        <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          Active Incident Severity Profiles
        </span>

        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider leading-relaxed pb-2 border-b border-border/20">
          Match appropriate visual and sensory triggers for incoming threat streams. This color choice will propagate globally into severity visualizers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {severities.map((sev) => {
            const activeColor = data.alertColors[sev];
            const hasSound = data.alertSounds[sev];
            const hasNotify = data.alertNotifications[sev];

            return (
              <div key={sev} className="p-4 bg-muted/40 border border-border/60 rounded-xl space-y-3.5 hover:border-border transition-all">
                <div className="flex items-center justify-between">
                  {/* Title and Dot */}
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-3 h-3 rounded-full shadow-lg transition-transform hover:scale-110" 
                      style={{ 
                        backgroundColor: activeColor,
                        boxShadow: `0 0 10px ${activeColor}55`
                      }} 
                    />
                    <span className="text-[11px] font-mono font-black uppercase tracking-wider text-foreground">
                      {sev} Level Setting
                    </span>
                  </div>

                  {/* HTML Color Picker input */}
                  <div className="flex items-center gap-2 font-mono text-[9px] text-muted-foreground bg-muted p-1 px-2 rounded-lg border border-border/60">
                    <span>COLOR:</span>
                    <input 
                      type="color" 
                      value={activeColor} 
                      onChange={(e) => handleColorChange(sev, e.target.value)}
                      className="w-4 h-4 bg-transparent outline-none border-0 rounded cursor-pointer"
                    />
                    <span className="uppercase text-[9px] tracking-widest font-bold text-foreground shrink-0">{activeColor}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[9.5px] font-mono">
                  {/* Sound Trigger */}
                  <button
                    onClick={() => handleSoundToggle(sev)}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                      hasSound 
                        ? `bg-[#06b6d4]/5 text-[#06b6d4] border-[#06b6d4]/20 font-black` 
                        : "bg-muted text-muted-foreground border-border/60 hover:text-foreground"
                    }`}
                  >
                    <span className="uppercase">AUDIO RE-PING</span>
                    <span className="text-[8px] uppercase tracking-wider">{hasSound ? "ACTIVE" : "MUTED"}</span>
                  </button>

                  {/* Notification Trigger */}
                  <button
                    onClick={() => handleNotificationToggle(sev)}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                      hasNotify 
                        ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20 font-black" 
                        : "bg-muted text-muted-foreground border-border/60 hover:text-foreground"
                    }`}
                  >
                    <span className="uppercase">NOTIFY DECK</span>
                    <span className="text-[8px] uppercase tracking-wider">{hasNotify ? "ON" : "OFF"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RETENTION SETTINGS */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Alert Retention Schedule
          </span>

          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider leading-relaxed">
            Select the storage lifespan duration for historic incident payloads before automatic deletion commands.
          </p>

          <div className="grid grid-cols-4 gap-2 font-mono text-[10px] pt-2">
            {["7 Days", "30 Days", "90 Days", "180 Days"].map((ret) => (
              <button
                key={ret}
                onClick={() => {
                  onChange("alertRetention", ret);
                  onToast(`STORAGE RETENTION PROFILE STAGED TO: ${ret.toUpperCase()}`, "info");
                }}
                className={`py-2 px-1 rounded-xl border text-[9px] font-mono uppercase font-black tracking-wider transition-all cursor-pointer ${
                  data.alertRetention === ret
                    ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                    : "bg-muted/40 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {ret}
              </button>
            ))}
          </div>
          <span className="text-[8px] font-mono block text-muted-foreground/60 uppercase">Recommended standard: 90 days for audit compliant teams.</span>
        </div>

        {/* ALERT AUTO CLOSE */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Automated Alert Garbage Collection
            </span>

            {/* Toggle switch */}
            <button
              onClick={() => {
                onChange("alertAutoClose", !data.alertAutoClose);
                onToast(`GARBAGE AUTO-CLOSE PROCESS ${!data.alertAutoClose ? 'INITIALIZED' : 'SUSPENDED'}`, "warning");
              }}
              className="text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              {data.alertAutoClose ? (
                <ToggleRight className="w-7 h-7 text-cyan-500" />
              ) : (
                <ToggleLeft className="w-7 h-7" />
              )}
            </button>
          </div>

          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider leading-relaxed">
            Automatically closes open low-severity incidents after they have expired past the duration specified below without any update.
          </p>

          {data.alertAutoClose && (
            <div className="space-y-2 pt-2 animate-in slide-in-from-top-1 duration-200">
              <span className="text-[8.5px] font-mono text-muted-foreground uppercase tracking-wider block font-bold">Close Open Alarms After:</span>
              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                {["1h", "6h", "24h"].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => {
                      onChange("alertAutoCloseDuration", dur);
                    }}
                    className={`py-2 rounded-xl border text-[9.5px] font-mono tracking-widest font-black transition-all cursor-pointer ${
                      data.alertAutoCloseDuration === dur
                        ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/40"
                        : "bg-muted/40 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
