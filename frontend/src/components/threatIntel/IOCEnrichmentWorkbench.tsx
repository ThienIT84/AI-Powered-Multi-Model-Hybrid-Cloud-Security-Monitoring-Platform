import React, { useState } from "react";
import { SearchCode, Sparkles, X, Globe, Shield, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function IOCEnrichmentWorkbench() {
  const [inputValue, setInputValue] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleEnrich = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsFinishing(true);
    setResult(null);

    // Simulate real enrichment latency
    setTimeout(() => {
      const value = inputValue.trim();
      const isIp = /^[0-9.]+$/.test(value);
      const isDomain = value.includes(".") && !value.includes("/") && !isIp;
      const isUrl = value.startsWith("http://") || value.startsWith("https://") || value.includes("/");
      const isHash = value.length >= 32 && !value.includes(".");

      let detectedType = "Unknown String";
      let reputation = "Suspicious Indicator";
      let threatScore = 48;
      let asn = "N/A";
      let geo = "Global Cast Routing";
      let actorLink = "Unassigned Syndicate";
      let related = ["N/A"];

      if (isIp) {
        detectedType = "IP Address";
        geo = "Russian Federation, Moscow";
        asn = "AS12044 (Rostelecom)";
        threatScore = 92;
        reputation = "Malicious Beacon Node";
        actorLink = "APT28 (Fancy Bear)";
        related = ["185.34.61.12", "microsoft-security-verify.com"];
      } else if (isDomain) {
        detectedType = "Domain CNAME";
        geo = "Germany, Frankfurt (Proxy route)";
        asn = "AS24940 (Hetzner Online GmbH)";
        threatScore = 88;
        reputation = "Compromised Update Mirror";
        actorLink = "APT28 / Wizard Spider overlaps";
        related = ["91.220.101.44", "update-kernel-sync.com"];
      } else if (isUrl) {
        detectedType = "Target URL";
        geo = "United States, San Jose";
        asn = "AS15169 (Google LLC Cloned Client)";
        threatScore = 97;
        reputation = "Weaponized Phishing Landing Hub";
        actorLink = "Lazarus Group";
        related = ["system-admin-update@mail-exchange-secure.org", "185.34.61.12"];
      } else if (isHash) {
        detectedType = "File Hash SHA256";
        geo = "Stored in VirusTotal Index";
        asn = "Entropy Match (>7.84)";
        threatScore = 99;
        reputation = "Conti-Stealer Executable Binary";
        actorLink = "Wizard Spider";
        related = ["8f4a34b29c9deef91a54ab413bcdee6312a814bd9ef52bc1947af773dd2b1ca4"];
      } else {
        // Dynamic generation for arbitrary queries
        threatScore = Math.floor(15 + Math.random() * 75);
        if (threatScore > 75) {
          reputation = "High Risk Reputation Match";
          actorLink = "Sandworm Team";
        } else if (threatScore > 40) {
          reputation = "Suspicious DNS Ad-Hoc Beacon";
          actorLink = "Unknown Actor Group";
        } else {
          reputation = "Stable / Unrated Network Anchor";
          actorLink = "No matches found";
        }
        geo = "United States, Ashburn";
        asn = "AS16509 (Amazon.com)";
        related = ["Unrated auxiliary mirror node"];
      }

      setResult({
        value,
        type: detectedType,
        threatScore,
        reputation,
        asn,
        geolocation: geo,
        actorLink,
        relatedIocs: related,
        vtDetections: threatScore > 75 ? `${Math.floor(threatScore * 0.72)} / 72 scanners flagged` : "3 / 72 scanners marked"
      });

      setIsFinishing(false);
    }, 600);
  };

  const clearWorkbench = () => {
    setInputValue("");
    setResult(null);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col h-full" id="ioc-enrichment-workbench">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <SearchCode size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-foreground tracking-wider font-mono">
              IOC Enrichment Workbench
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Evaluate real-time indicators and parse threat actor alignment
            </p>
          </div>
        </div>
      </div>

      {/* Input form */}
      <form onSubmit={handleEnrich} className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Input IP, domain, hash, URL (e.g. 185.34.61.12)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-muted/40 border border-border focus:border-purple-500 rounded-lg px-3 py-1.5 text-[10px] font-mono text-foreground placeholder:text-muted-foreground outline-hidden tracking-normal"
          />
          {inputValue && (
            <button
              type="button"
              onClick={clearWorkbench}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isFinishing || !inputValue.trim()}
          className="px-4 py-1.5 bg-purple-600 dark:bg-purple-600 hover:bg-purple-500 hover:shadow-xs active:scale-98 font-mono text-white text-[10px] font-bold uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {isFinishing ? (
            <>
              <RefreshCw size={11} className="animate-spin" />
              Enriching
            </>
          ) : (
            <>
              <Sparkles size={11} />
              Enrich IOC
            </>
          )}
        </button>
      </form>

      {/* Results panel */}
      <div className="flex-1 flex flex-col justify-center min-h-47.5">
        <AnimatePresence mode="wait">
          {!result ? (
            <div className="text-center py-6 border border-dashed border-border/60 rounded-xl bg-muted/5 flex flex-col items-center justify-center p-4">
              <Globe size={24} className="text-muted-foreground/35 mb-2 animate-pulse" />
              <p className="text-[10px] font-mono text-muted-foreground uppercase font-black">
                Awaiting Target Value
              </p>
              <p className="text-[9px] text-muted-foreground/60 max-w-50 mt-1">
                Provide an indicator to instantly match routing paths and threat indexes
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="bg-muted/15 border border-border p-3.5 rounded-xl font-mono text-[9px] space-y-3 leading-relaxed"
            >
              {/* Header result row */}
              <div className="flex items-start justify-between border-b border-border/40 pb-2">
                <div>
                  <span className="text-[7.5px] uppercase font-bold text-muted-foreground">Enriched Indicator</span>
                  <div className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 break-all select-none">
                    {result.value}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[7px] uppercase font-bold text-muted-foreground">Th. Score</span>
                  <div className={`text-sm font-black ${result.threatScore > 75 ? "text-red-600 dark:text-red-400" : "text-amber-500"}`}>
                    {result.threatScore} / 100
                  </div>
                </div>
              </div>

              {/* Data attributes grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground text-[7.5px] uppercase block">Indicator Class</span>
                  <span className="text-foreground font-bold">{result.type}</span>
                </div>

                <div>
                  <span className="text-muted-foreground text-[7.5px] uppercase block">Reputation</span>
                  <span className="text-foreground font-bold text-wrap leading-tight">{result.reputation}</span>
                </div>

                <div>
                  <span className="text-muted-foreground text-[7.5px] uppercase block">Location Route</span>
                  <span className="text-foreground font-bold">{result.geolocation}</span>
                </div>

                <div>
                  <span className="text-muted-foreground text-[7.5px] uppercase block">ASN Endpoint</span>
                  <span className="text-foreground font-bold font-mono tracking-tight">{result.asn}</span>
                </div>

                <div>
                  <span className="text-muted-foreground text-[7.5px] uppercase block">Actor Alignment</span>
                  <span className="text-purple-600 dark:text-purple-400 font-extrabold">{result.actorLink}</span>
                </div>

                <div>
                  <span className="text-muted-foreground text-[7.5px] uppercase block">AV Sandboxes Flagged</span>
                  <span className="text-foreground font-bold">{result.vtDetections}</span>
                </div>
              </div>

              {/* Associations array */}
              <div className="border-t border-border/40 pt-2 text-[8px] space-y-1">
                <span className="text-muted-foreground text-[7.5px] uppercase block font-bold">Related TI Indicators</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.relatedIocs.map((item: string, i: number) => (
                    <span
                      key={i}
                      className="bg-card border border-border/80 px-1.5 py-0.5 rounded text-foreground font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
