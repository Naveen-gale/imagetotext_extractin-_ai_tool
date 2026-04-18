import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  mindmap: { padding: 20 },
});

export default function Mermaid({ chart }) {
  const containerRef = useRef(null);
  const [svgStr, setSvgStr] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!chart || !containerRef.current) return;
    
    let isMounted = true;
    
    const renderChart = async () => {
      try {
        setError(false);
        const id = `mermaid-svg-${Date.now()}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) {
          setSvgStr(svg);
        }
      } catch (e) {
        console.error("Mermaid parsing error:", e);
        if (isMounted) setError(true);
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 rounded-xl text-sm font-bold">
        Unable to render diagram. The AI produced invalid format. You can still view the raw text.
        <pre className="mt-2 text-[10px] overflow-auto text-slate-400">{chart}</pre>
      </div>
    );
  }

  return (
    <div 
      className="mermaid w-full overflow-x-auto flex justify-center items-center p-4 bg-slate-900 border border-slate-700 rounded-xl"
      dangerouslySetInnerHTML={{ __html: svgStr }} 
      ref={containerRef}
    />
  );
}
