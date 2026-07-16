import { FormEvent, useCallback, useEffect, useState } from "react";
import { BookOpen, Plus, RefreshCw } from "lucide-react";
import { apiRequest } from "../api/client";
import { BackendEmptyState } from "../components/common/BackendEmptyState";

interface BackendPlaybook {
  id: string;
  name: string;
  description?: string;
  status?: string;
  trigger?: string;
  steps?: Array<{ name?: string; action?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<BackendPlaybook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPlaybooks(await apiRequest<BackendPlaybook[]>("/api/playbooks"));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load playbooks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      await apiRequest<BackendPlaybook>("/api/playbooks", { method: "POST", body: { name: name.trim(), description: description.trim(), steps: [] } });
      setName("");
      setDescription("");
      setShowCreate(false);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create playbook");
    }
  };

  return (
    <div className="space-y-6 pb-12 text-foreground">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3"><div className="rounded-lg bg-teal-500/10 p-2 text-teal-500"><BookOpen size={20} /></div><div><h1 className="text-xl font-black uppercase tracking-tight">Response playbooks</h1><p className="mt-1 text-xs text-muted-foreground">Stored by the backend. An empty list means no playbooks are configured.</p></div></div>
        <div className="flex gap-2"><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-[10px] font-black uppercase"><RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh</button><button type="button" onClick={() => setShowCreate((value) => !value)} className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-2 text-[10px] font-black uppercase text-cyan-500"><Plus size={12} /> Add playbook</button></div>
      </div>

      {showCreate && <form onSubmit={create} className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[1fr_2fr_auto]"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Playbook name" className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs outline-none" /><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs outline-none" /><button className="rounded-lg bg-cyan-600 px-4 py-2 text-[10px] font-black uppercase text-white">Create</button></form>}
      {error && <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-xs text-red-500">{error}</div>}
      {!loading && playbooks.length === 0 ? <BackendEmptyState title="No backend playbooks" description="Create a playbook above or configure the backend playbook repository. No procedure templates are seeded in the browser." onRetry={() => void load()} /> : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {playbooks.map((playbook) => <article key={playbook.id} className="rounded-xl border border-border bg-card p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{playbook.id}</p><h2 className="mt-1 text-sm font-black">{playbook.name}</h2></div><span className="rounded border border-border bg-muted/30 px-2 py-1 text-[9px] font-black uppercase">{playbook.status ?? "configured"}</span></div><p className="mt-3 text-xs text-muted-foreground">{playbook.description || "No description supplied."}</p><div className="mt-3 text-[10px] text-muted-foreground">Trigger: {playbook.trigger ?? "—"} · Steps: {playbook.steps?.length ?? 0}</div></article>)}
        </div>
      )}
    </div>
  );
}

export default PlaybooksPage;
