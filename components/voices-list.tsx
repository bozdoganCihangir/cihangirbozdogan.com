import type { Voice } from "@/lib/types";
import { VoiceCard } from "./voice-card";

export function VoicesList({ voices }: { voices: Voice[] }) {
  const populated = voices.filter((v) => v.posts.length > 0);

  if (populated.length === 0) {
    return (
      <div className="rounded border border-dashed border-rule p-8 text-center text-sm text-ink-muted">
        <p>No recent posts from the roster.</p>
        <p className="mt-1">
          Run{" "}
          <code className="font-mono text-ink bg-paper-subtle px-1.5 py-0.5 rounded border border-rule-soft">
            /refresh
          </code>{" "}
          in Claude Code to populate.
        </p>
      </div>
    );
  }

  return (
    <section>
      <header className="mb-6 pb-3 border-b border-rule">
        <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">
          Voices · last 30 days
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink mt-1 leading-tight">
          From engineers worth following
        </h1>
        <p className="text-sm text-ink-faint mt-1">
          Latest posts from a curated roster — backend, frontend, infra, devops, AI.
        </p>
      </header>
      <div>
        {populated.map((voice) => (
          <VoiceCard key={voice.author} voice={voice} />
        ))}
      </div>
    </section>
  );
}
