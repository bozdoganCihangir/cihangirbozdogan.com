import type { Voice } from "@/lib/types";

export function VoiceCard({ voice }: { voice: Voice }) {
  if (voice.posts.length === 0) return null;
  return (
    <article className="border-b border-rule-soft py-7 first:pt-0 last:border-b-0">
      <header className="mb-4">
        <a
          href={voice.url}
          target="_blank"
          rel="noreferrer noopener"
          className="font-serif text-2xl font-semibold tracking-tight text-ink hover:text-accent transition-colors"
        >
          {voice.author}
        </a>
      </header>
      <ul className="space-y-5">
        {voice.posts.map((post, i) => (
          <li key={`${voice.author}-${i}`}>
            <a
              href={post.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group block"
            >
              <h3 className="font-serif text-[18px] leading-snug font-semibold text-ink group-hover:text-accent transition-colors">
                {post.title}
              </h3>
              <p className="mt-1.5 text-[15px] text-ink-muted leading-relaxed">
                {post.summary}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
