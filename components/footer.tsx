export function Footer() {
  return (
    <footer className="border-t border-rule mt-auto">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-14 py-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Curated by Cihangir Bozdogan —{" "}
          <a
            href="mailto:bozdogan.cihangir@gmail.com"
            className="normal-case tracking-normal text-accent hover:text-accent-hover transition-colors font-semibold"
          >
            bozdogan.cihangir@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
}
