import React, { useState } from "react";
import { ShieldCheck, Percent, HelpCircle, FileSpreadsheet, Check, AlertCircle, AlertTriangle } from "lucide-react";

interface ThreatRow {
  name: string;
  detection: "Covered" | "Partial" | "Missing";
  investigation: "Covered" | "Partial" | "Missing";
  containment: "Covered" | "Partial" | "Missing";
  recovery: "Covered" | "Partial" | "Missing";
  notes: string;
}

export function PlaybookCoverageMatrix() {
  const threats: ThreatRow[] = [
    {
      name: "SQL Injection",
      detection: "Covered",
      investigation: "Covered",
      containment: "Covered",
      recovery: "Covered",
      notes: "Direct signatures inside boundary WAF logs and pg_stat audits."
    },
    {
      name: "XSS",
      detection: "Partial",
      investigation: "Covered",
      containment: "Partial",
      recovery: "Covered",
      notes: "Persistent DOM-based injections require manual code assessment audits."
    },
    {
      name: "DoS",
      detection: "Covered",
      investigation: "Covered",
      containment: "Covered",
      recovery: "Covered",
      notes: "Edge scrubbing interfaces trigger standard operational playbooks."
    },
    {
      name: "Brute Force",
      detection: "Covered",
      investigation: "Covered",
      containment: "Covered",
      recovery: "Covered",
      notes: "SSO login failure triggers and threshold alarms automate lockout."
    },
    {
      name: "Credential Stuffing",
      detection: "Covered",
      investigation: "Covered",
      containment: "Covered",
      recovery: "Covered",
      notes: "WAF rate boundaries handle large multi-username attempts clusters."
    },
    {
      name: "Command Injection",
      detection: "Missing",
      investigation: "Partial",
      containment: "Missing",
      recovery: "Missing",
      notes: "SOP document current drafting underway. Standardizing host telemetry."
    },
    {
      name: "Malware",
      detection: "Covered",
      investigation: "Covered",
      containment: "Covered",
      recovery: "Covered",
      notes: "Antivirus API callbacks and EDR alert telemetry integration."
    },
    {
      name: "Lateral Movement",
      detection: "Partial",
      investigation: "Covered",
      containment: "Covered",
      recovery: "Partial",
      notes: "Internal active swept path maps depend on host telemetry logs."
    },
    {
      name: "Data Exfiltration",
      detection: "Covered",
      investigation: "Covered",
      containment: "Covered",
      recovery: "Covered",
      notes: "High outbound byte threshold triggers automatically target exfiltration."
    }
  ];

  const columns = [
    { key: "detection", label: "Detection" },
    { key: "investigation", label: "Investigation" },
    { key: "containment", label: "Containment" },
    { key: "recovery", label: "Recovery" }
  ] as const;

  const statusStyles = {
    Covered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold",
    Partial: "bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold",
    Missing: "bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold"
  };

  const getStatusIcon = (status: "Covered" | "Partial" | "Missing") => {
    switch (status) {
      case "Covered":
        return <Check size={10} className="text-emerald-400 shrink-0" />;
      case "Partial":
        return <AlertTriangle size={10} className="text-amber-500 shrink-0" />;
      case "Missing":
        return <AlertCircle size={10} className="text-rose-400 shrink-0" />;
    }
  };

  // Compute stats
  const totalCells = threats.length * columns.length;
  let coveredCells = 0;
  let partialCells = 0;
  let missingCells = 0;

  threats.forEach(t => {
    columns.forEach(col => {
      const val = t[col.key];
      if (val === "Covered") coveredCells++;
      else if (val === "Partial") partialCells++;
      else if (val === "Missing") missingCells++;
    });
  });

  const rating = ((coveredCells + partialCells * 0.5) / totalCells) * 100;

  return (
    <div
      id="playbook-coverage-matrix"
      className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-xs flex flex-col gap-4 font-mono select-none"
    >
      {/* Container Header */}
      <div className="border-b border-border/40 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <FileSpreadsheet size={13} className="text-cyan-500 shrink-0" />
          <div>
            <h2 className="text-[10px] md:text-xs font-black text-foreground uppercase tracking-widest leading-none">
              Playbook Threat Coverage Matrix
            </h2>
            <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest mt-1 block">
              Governance view checking procedure availability against security threats
            </span>
          </div>
        </div>

        {/* Aggregate metric pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-muted-foreground border border-border/80 rounded-lg px-2.5 py-1 bg-muted/20 shrink-0">
            <Percent size={11} className="text-emerald-400 shrink-0" />
            <span>MAPPED RATIO:</span>
            <span className="text-foreground">{rating.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Grid coverage stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-[7.5px] uppercase font-bold text-muted-foreground">
        <div className="bg-muted/10 border border-border/40 rounded-lg p-1.5 flex flex-col justify-center">
          <span className="text-[11px] font-black text-emerald-400 leading-none">
            {coveredCells}
          </span>
          <span className="mt-1 leading-none">Covered Areas</span>
        </div>
        <div className="bg-muted/10 border border-border/40 rounded-lg p-1.5 flex flex-col justify-center">
          <span className="text-[11px] font-black text-amber-500 leading-none">
            {partialCells}
          </span>
          <span className="mt-1 leading-none font-black text-amber-500/80">Partial Areas</span>
        </div>
        <div className="bg-muted/10 border border-border/40 rounded-lg p-1.5 flex flex-col justify-center">
          <span className="text-[11px] font-black text-rose-450 leading-none">
            {missingCells}
          </span>
          <span className="mt-1 leading-none font-black text-rose-500/80">Missing Areas</span>
        </div>
      </div>

      {/* Coverage Matrix Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-[8.5px] border-collapse font-mono">
          <thead>
            <tr className="border-b border-border/40 bg-muted/20 text-[7.5px] text-muted-foreground uppercase tracking-wider font-extrabold">
              <th className="py-2 px-2.5 font-black uppercase">Threat Type Target</th>
              {columns.map(col => (
                <th key={col.key} className="py-2 px-2 text-center font-black uppercase w-24">
                  {col.label}
                </th>
              ))}
              <th className="py-2 px-2 max-w-30 font-black uppercase hidden md:table-cell">Details / Gaps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {threats.map((row, i) => (
              <tr key={row.name} className="hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-2.5 font-black uppercase text-foreground">
                  {row.name}
                </td>
                {columns.map(col => {
                  const status = row[col.key];
                  return (
                    <td key={col.key} className="py-1.5 px-2 text-center">
                      <span className={`px-2 py-1 rounded-md border text-[7.5px] uppercase tracking-wide inline-flex items-center gap-1 justify-center w-full max-w-20 leading-none ${statusStyles[status]}`}>
                        {getStatusIcon(status)}
                        <span>{status}</span>
                      </span>
                    </td>
                  );
                })}
                <td className="py-2.5 px-2 text-[7.5px] text-muted-foreground/90 uppercase font-semibold max-w-30 truncate hidden md:table-cell">
                  {row.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
