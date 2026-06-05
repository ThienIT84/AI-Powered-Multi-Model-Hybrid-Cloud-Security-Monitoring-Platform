import React, { useState, useRef } from "react";
import { FolderSync, Download, Upload, Cpu, Play, CheckCircle2, AlertTriangle, FileJson } from "lucide-react";

interface BackupSettingsTabProps {
  currentSettings: any;
  onRestore: (parsedSettings: any) => void;
  onToast: (msg: string, type?: "success" | "warning" | "info") => void;
}

export function BackupSettingsTab({ currentSettings, onRestore, onToast }: BackupSettingsTabProps) {
  const [createdBackups, setCreatedBackups] = useState<Array<{ id: string; timestamp: string; size: string }>>([
    { id: "SOC_BACKUP_v3.0_INIT_RECV", timestamp: "2026-06-01 10:14:22", size: "12 KB" },
    { id: "SOC_BACKUP_v3.0_STABLE_STATE", timestamp: "2026-06-04 18:42:01", size: "14 KB" },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadSettings = () => {
    onToast("SERIALIZING PLATFORM STATE ENGINE...", "info");
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentSettings, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `zeek_ai_soc_config_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onToast("CONFIGURATION PROTOCOLS DOWNLOADED SUCCESSFULLY!", "success");
    } catch (err) {
      onToast("FAILED TO SERIALIZE SETTINGS STORAGE DATA", "warning");
    }
  };

  const handleCreateDraftBackup = () => {
    setIsGenerating(true);
    onToast("ALLOCATING BACKUP SECTOR BUFFER...", "info");

    setTimeout(() => {
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);
      const randHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
      const newBackup = {
        id: `SOC_BKP_${now.replace(/[- :]/g, "")}_${randHex}`,
        timestamp: now,
        size: "15 KB"
      };

      setCreatedBackups((prev) => [newBackup, ...prev]);
      setIsGenerating(false);
      onToast("SYSTEM BACKUP SECTOR COMMITTED SUCCESSFULLY!", "success");
    }, 1300);
  };

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    onToast("UPLOADING FILE BUFFER...", "info");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        
        // Basic check to see if it looks like settings or valid json
        if (typeof parsed === "object" && parsed !== null) {
          setParsedPreview(parsed);
          onToast("FILE PARSED SUCCESSFULLY! REVIEW CHANGES IN THE CORE PREVIEW PORTAL BELOWN.", "success");
        } else {
          onToast("INVALID BACKUP STRUCTURATION FILE CHOSEN.", "warning");
          setParsedPreview(null);
        }
      } catch (err) {
        onToast("UPLOAD ENGINE ERROR: COULD NOT PARSE FILE AS VALID JSON.", "warning");
        setParsedPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyRestore = () => {
    if (!parsedPreview) return;
    onRestore(parsedPreview);
    onToast("RESTORATION ARCHITECTURE MERGED INTO LIVE MEMORY BUFFER!", "success");
    setParsedPreview(null);
    setUploadedFileName("");
  };

  const deleteSavedLocalBackup = (id: string) => {
    setCreatedBackups((prev) => prev.filter(b => b.id !== id));
    onToast("DELETED SAVED LOCAL BACKUP VECTOR", "info");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          <FolderSync className="w-4 h-4 text-cyan-500" />
          Recovery Protocols, Snapshotting & Restore
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-normal">
          Export system configurations to JSON templates, commit live checkpoint backups, and restore platform structures
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* EXPORT SNAPSHOTS & BACKUP GENERATION */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Checkpoint Snapshot Creator & Download
          </span>

          <div className="space-y-3 pt-2 font-mono text-[9.5px]">
            <div className="p-3 bg-muted/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-foreground tracking-widest font-black uppercase">Configuration Export (.json)</span>
                <span className="text-muted-foreground block text-[7.5px] uppercase mt-1">Saves all 12 platform setup categories</span>
              </div>
              <button
                onClick={handleDownloadSettings}
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/10 transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Download JSON
              </button>
            </div>

            <div className="p-3 bg-muted/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-foreground tracking-widest font-black uppercase">Generate Direct Endpoint Backup</span>
                <span className="text-muted-foreground block text-[7.5px] uppercase mt-1">Commit system checkpoint instantly</span>
              </div>
              <button
                onClick={handleCreateDraftBackup}
                disabled={isGenerating}
                className="px-3.5 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FolderSync className="w-3.5 h-3.5" />
                    Commit Backup
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider block">Historically Generated Local Checkpoints</span>
              <div className="space-y-1.5 max-h-35 overflow-y-auto custom-scrollbar">
                {createdBackups.map((b) => (
                  <div key={b.id} className="flex justify-between items-center bg-slate-100/80 dark:bg-zinc-950/45 p-2 rounded-lg border border-border/60 text-[8.5px]">
                    <div>
                      <span className="text-zinc-850 dark:text-foreground font-black tracking-widest uppercase block truncate w-45">{b.id}</span>
                      <span className="text-zinc-600 dark:text-muted-foreground block text-[7px] font-bold dark:font-normal">{b.timestamp} ({b.size})</span>
                    </div>
                    <button
                      onClick={() => deleteSavedLocalBackup(b.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-500 font-extrabold uppercase ml-2 text-[8px]"
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RESTORE JSON STRUCTURES */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            Integrate & Implement Backup File JSON
          </span>

          <div className="space-y-4 pt-1 font-mono text-[9.5px]">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider leading-relaxed">
              Upload a matching `.json` template matching the platform configurations to run previews and safely restore states.
            </p>

            {/* Input uploader wrapper */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/70 rounded-xl p-6 hover:bg-muted/10 cursor-pointer text-center space-y-2 group transition-all"
            >
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleUploadFileChange}
                accept=".json"
                className="hidden"
              />
              <FileJson className="w-8 h-8 text-muted-foreground group-hover:text-cyan-500 stroke-1 mx-auto transition-colors" />
              {uploadedFileName ? (
                <div className="space-y-1">
                  <span className="text-[10.5px] text-foreground font-extrabold block truncate px-2">{uploadedFileName}</span>
                  <span className="text-[7.5px] text-emerald-400 uppercase font-black block">Ready to Parse</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-[9.5px] text-foreground font-extrabold block uppercase tracking-wider">Drag or Select Backup JSON</span>
                  <span className="text-[7.5px] text-muted-foreground/80 block uppercase">Compatible with export system files</span>
                </div>
              )}
            </div>

            {/* Parse preview pane */}
            {parsedPreview && (
              <div className="bg-slate-50 dark:bg-zinc-950/70 rounded-xl p-4.5 border border-cyan-500/25 space-y-3.5 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Valid Payload parsed</span>
                </div>

                <div className="bg-slate-100/80 dark:bg-black/30 p-2.5 rounded border border-border/60 max-h-25 overflow-y-auto custom-scrollbar text-[8.5px] text-zinc-750 dark:text-muted-foreground">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(parsedPreview, null, 2)}</pre>
                </div>

                <div className="flex gap-2 text-[9px]">
                  <button 
                    onClick={() => {
                      setParsedPreview(null);
                      setUploadedFileName("");
                    }}
                    className="flex-1 py-1.5 bg-muted text-muted-foreground hover:text-foreground font-black border border-border uppercase rounded-md text-center transition-colors"
                  >
                    Discard Choice
                  </button>
                  <button 
                    onClick={handleApplyRestore}
                    className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase rounded-md shadow-lg shadow-cyan-500/10 text-center transition-colors"
                  >
                    Apply Restore
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
