import { useEffect, useId, useState } from "react";

type MermaidDiagramProps = {
  chart: string;
};

type RenderState = {
  chart: string;
  error: string;
  svg: string;
};

function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const reactId = useId();
  const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [renderState, setRenderState] = useState<RenderState | null>(null);
  const currentRenderState = renderState?.chart === chart ? renderState : null;
  const svg = currentRenderState?.svg ?? "";
  const error = currentRenderState?.error ?? "";

  useEffect(() => {
    let isCurrent = true;
    const isDark = document.documentElement.classList.contains("dark");

    import("mermaid")
      .then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: isDark ? "dark" : "default",
        });

        return mermaid.render(diagramId, chart);
      })
      .then((result) => {
        if (isCurrent) {
          setRenderState({ chart, error: "", svg: result.svg });
        }
      })
      .catch((renderError: unknown) => {
        if (isCurrent) {
          setRenderState({
            chart,
            error:
              renderError instanceof Error
                ? renderError.message
                : "Unable to render Mermaid diagram.",
            svg: "",
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [chart, diagramId]);

  if (error) {
    return (
      <div className="max-w-3xl overflow-hidden rounded-lg border border-red-200 bg-red-50 text-red-950 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100">
        <div className="border-b border-red-200 px-4 py-2 text-xs font-semibold dark:border-red-900/60">
          Mermaid
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap px-4 py-4 text-sm leading-6">
          {error}
        </pre>
      </div>
    );
  }

  return (
    <div className="max-w-3xl overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950">
      {svg ? (
        <div
          className="[&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Rendering diagram...
        </div>
      )}
    </div>
  );
}

export default MermaidDiagram;
