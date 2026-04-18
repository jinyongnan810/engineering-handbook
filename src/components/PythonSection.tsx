type PythonSectionProps = {
  code: string;
};

function PythonSection({ code }: PythonSectionProps) {
  return (
    <section className="rounded-[24px] border border-border/80 bg-[#1f1b18] p-6 text-[#f7f0e2] shadow-[0_20px_60px_rgba(34,22,7,0.16)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d7c8aa]">
        Python Example
      </p>
      <pre className="mt-4 overflow-x-auto text-sm leading-7 whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
    </section>
  );
}

export default PythonSection;
