'use client';

import React, { useEffect, useRef } from 'react';

export default function PlotlyGraph({
  props: { graph },
}: {
  props: {
    graph: PlotlyGraphProps;
  };
}): React.JSX.Element {
  const graphRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!graphRef.current || isInitialized.current) return;

    const initializePlotly = () => {
      const data: PlotlyData[] = [];

      graph.segments.forEach((segment) => {
        data.push({
          x: segment.x,
          y: segment.y,
          mode: segment.mode,
          name: segment.name,
          type: 'scatter',
          line: segment.line ? {
            dash: segment.line.dash,
            width: segment.line.width,
            color: segment.line.color,
          } : undefined,
        });
      });

      graph.jumpPoints?.forEach((jumpPoint) => {
        data.push({
          x: [jumpPoint.x, jumpPoint.x],
          y: [jumpPoint.yStart, jumpPoint.yEnd],
          mode: 'lines+markers',
          name: jumpPoint.name,
          type: 'scatter',
          line: jumpPoint.lineStyle ? {
            dash: jumpPoint.lineStyle.dash,
            width: jumpPoint.lineStyle.width,
            color: jumpPoint.lineStyle.color,
          } : { dash: 'dot', width: 2, color: 'red' },
        });
      });

      const layout: PlotlyLayout = {
        title: graph.title ?? '',
        xaxis: {
          title: graph.xAxis?.title ?? '',
          range: graph.xAxis?.range ?? [0, 100],
        },
        yaxis: {
          title: graph.yAxis?.title ?? '',
          range: graph.yAxis?.range ?? [0, 100],
        },
        width: graph.width ?? '100%',
        height: graph.height ?? '400px',
      };

      window.Plotly.newPlot(graphRef.current?.id ?? '', data, layout);
      isInitialized.current = true;
    };

    if (window.Plotly) {
      initializePlotly();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
      script.onload = initializePlotly;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [graph]);

  useEffect(() => {
    if (!isInitialized.current || !window.Plotly || !graphRef.current) return;

    const updateGraph = () => {
      const data: PlotlyData[] = [];

      graph.segments.forEach((segment) => {
        data.push({
          x: segment.x,
          y: segment.y,
          mode: segment.mode,
          name: segment.name,
          type: 'scatter',
          line: segment.line ? {
            dash: segment.line.dash,
            width: segment.line.width,
            color: segment.line.color,
          } : undefined,
        });
      });

      graph.jumpPoints?.forEach((jumpPoint) => {
        data.push({
          x: [jumpPoint.x, jumpPoint.x],
          y: [jumpPoint.yStart, jumpPoint.yEnd],
          mode: 'lines+markers',
          name: jumpPoint.name,
          type: 'scatter',
          line: jumpPoint.lineStyle ? {
            dash: jumpPoint.lineStyle.dash,
            width: jumpPoint.lineStyle.width,
            color: jumpPoint.lineStyle.color,
          } : { dash: 'dot', width: 2, color: 'red' },
        });
      });

      const layout: Partial<PlotlyLayout> = {
        title: graph.title ?? '',
        xaxis: {
          title: graph.xAxis?.title ?? '',
          range: graph.xAxis?.range ?? [0, 100],
        },
        yaxis: {
          title: graph.yAxis?.title ?? '',
          range: graph.yAxis?.range ?? [0, 100],
        },
        width: graph.width,
        height: graph.height,
      };

      window.Plotly.react(graphRef.current?.id ?? '', data, layout);
    };

    updateGraph();
  }, [graph]);

  return (
    <div 
      id="dynamic-plotly-graph" 
      ref={graphRef}
      className={graph.className}
      style={{ 
        width: graph.width, 
        height: graph.height 
      }}
    />
  );
}
