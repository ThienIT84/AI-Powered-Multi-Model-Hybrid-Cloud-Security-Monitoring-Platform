import React, { useState, useMemo } from "react";
import { ThreatKnowledgeArticle } from "./types";
import { BookOpen, Search, Tag, Eye, ArrowRight, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ThreatKnowledgeBaseProps {
  articles: ThreatKnowledgeArticle[];
}

export function ThreatKnowledgeBase({ articles }: ThreatKnowledgeBaseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [inspectedArticleId, setInspectedArticleId] = useState<string | null>(null);

  // Filter articles list
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchSearch =
        searchTerm.trim() === "" ||
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = selectedType === "ALL" || article.type === selectedType;

      return matchSearch && matchType;
    });
  }, [articles, searchTerm, selectedType]);

  const inspectedArticle = articles.find((a) => a.id === inspectedArticleId);

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col h-full" id="threat-knowledge-base">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3 mb-3 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <BookOpen size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-foreground tracking-wider font-mono">
              Threat Knowledge Base
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Vetted technical briefings, tactical advisories, and threat profiles
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search briefings (e.g. Cobalt Strike, Ryuk, OAuth...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-muted/40 border border-border focus:border-purple-500 rounded-lg pl-8 pr-3 py-1.5 text-[9px] uppercase placeholder:text-muted-foreground outline-hidden font-mono text-foreground"
          />
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-muted/40 border border-border focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase cursor-pointer outline-hidden font-mono text-foreground h-full"
          >
            <option value="ALL">TYPE (ALL)</option>
            <option value="Threat Report">Threat Reports</option>
            <option value="Threat Profile">Threat Profiles</option>
            <option value="Advisory">Advisories</option>
            <option value="Reference Article">Reference Articles</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Articles List */}
        <div className={`space-y-1.5 max-h-55 overflow-y-auto pr-1 ${inspectedArticle ? "lg:col-span-6" : "lg:col-span-12"}`}>
          {filteredArticles.length === 0 ? (
            <p className="text-[9px] text-muted-foreground font-mono italic p-4 text-center border border-dashed border-border/60 rounded-xl bg-muted/5">
              No technical briefings found match your query.
            </p>
          ) : (
            filteredArticles.map((article) => {
              const isInspected = inspectedArticleId === article.id;
              return (
                <div
                  key={article.id}
                  onClick={() => setInspectedArticleId(isInspected ? null : article.id)}
                  className={`p-3 rounded-lg border transition-all flex flex-col justify-between cursor-pointer ${
                    isInspected
                      ? "bg-purple-500/10 border-purple-500/50 dark:bg-purple-950/20"
                      : "bg-muted/20 border-border/50 hover:bg-muted/30"
                  }`}
                >
                  <div className="space-y-1 font-mono text-[9px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[7px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 px-1.5 py-0.2 rounded border border-purple-500/10">
                        {article.type}
                      </span>
                      <span className="text-slate-400 text-[8px]">- Pub: {article.publishedDate}</span>
                    </div>

                    <h4 className="text-[10px] font-extrabold text-foreground leading-snug uppercase tracking-tight">
                      {article.title}
                    </h4>

                    <p className="text-muted-foreground text-[8.5px] line-clamp-2 leading-relaxed font-sans font-medium">
                      {article.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/20 pt-1.5 mt-2 text-[8px] text-muted-foreground font-mono">
                    <span className="truncate max-w-37.5">By {article.author}</span>
                    <span className="text-purple-600 dark:text-purple-400 text-[7px] font-black uppercase flex items-center gap-0.5">
                      {isInspected ? "Collapse View" : "Examine Article"}
                      <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Inspected Article Details Slide Panel */}
        <AnimatePresence mode="wait">
          {inspectedArticle && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="lg:col-span-6 bg-muted/15 border border-border p-3.5 rounded-xl font-mono text-[9px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between border-b border-border/40 pb-2 mb-2">
                  <div>
                    <span className="text-[7px] uppercase font-bold text-muted-foreground">{inspectedArticle.type}</span>
                    <h4 className="text-[10.5px] font-black text-purple-600 dark:text-purple-400 uppercase leading-snug tracking-tight">
                      {inspectedArticle.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => setInspectedArticleId(null)}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded bg-muted hover:bg-muted/80 shrink-0 ml-2"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3 font-mono">
                  <div className="text-[8px] text-slate-500">
                    <div>Author: <strong className="text-foreground">{inspectedArticle.author}</strong></div>
                    <div>Published: <strong className="text-foreground">{inspectedArticle.publishedDate}</strong></div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-[7.5px] uppercase block font-bold">Briefing Overview</span>
                    <p className="text-foreground text-[8.5px] text-justify leading-relaxed font-sans font-medium uppercase tracking-tight">
                      {inspectedArticle.summary}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-[7.5px] uppercase block font-bold">Metadata Tags</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {inspectedArticle.tags.map((tag, i) => (
                        <span key={i} className="bg-muted/60 border border-border/80 px-1.5 py-0.5 rounded text-[8px] text-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-[7.5px] uppercase block font-bold">Standard References</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {inspectedArticle.references.map((ref, i) => (
                        <span
                          key={i}
                          className="bg-purple-500/5 border border-purple-500/25 px-1.5 py-0.5 rounded text-[8px] text-purple-600 dark:text-purple-400 font-extrabold"
                        >
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/40 pt-2 mt-4 text-center">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-1 text-[8.5px] text-purple-600 dark:text-purple-400 hover:underline uppercase font-extrabold"
                >
                  <ExternalLink size={10} />
                  Access Full Internal Technical brief Document
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
