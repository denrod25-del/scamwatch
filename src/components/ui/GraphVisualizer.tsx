'use client';

import React, { useState } from 'react';

export interface GraphNode {
  id: string;
  label: string;
  type: 'entity' | 'report' | 'campaign';
  risk?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
}

interface GraphVisualizerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export default function GraphVisualizer({ nodes, edges }: GraphVisualizerProps): React.JSX.Element {
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Position nodes radially around the center (300, 200) for simple visualization
  const width = 600;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;

  const positionedNodes = nodes.map((node, index) => {
    if (index === 0) {
      return { ...node, x: cx, y: cy };
    }
    const angle = (2 * Math.PI * (index - 1)) / (nodes.length - 1);
    const radius = 130;
    return {
      ...node,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  const nodeMap = new Map(positionedNodes.map((n) => [n.id, n]));

  // Color mappings
  const getColor = (type: string) => {
    switch (type) {
      case 'entity':
        return '#ea580c'; // Brand orange
      case 'report':
        return '#10b981'; // Green
      case 'campaign':
        return '#ef4444'; // Red
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="panel overflow-hidden border border-border bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text">
          Interactive Relationship Graph
        </h3>
        <div className="flex items-center gap-3">
          <label className="text-xs text-text-subtle">Zoom:</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-20 accent-brand"
          />
          <button
            onClick={() => {
              setScale(1);
              setPanX(0);
              setPanY(0);
            }}
            className="px-2 py-0.5 text-[10px] uppercase font-bold border border-border rounded bg-background hover:bg-hover text-text"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="relative border border-border bg-background rounded-lg overflow-hidden h-[400px]">
        {/* SVG Drawing Canvas */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          className="cursor-grab active:cursor-grabbing"
        >
          <g transform={`translate(${panX}, ${panY}) scale(${scale})`}>
            {/* Draw Edges */}
            {edges.map((edge, idx) => {
              const src = nodeMap.get(edge.source);
              const tgt = nodeMap.get(edge.target);
              if (!src || !tgt) return null;
              return (
                <line
                  key={idx}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="#374151"
                  strokeWidth={2}
                  strokeDasharray={edge.type === 'extracted' ? '0' : '4'}
                  opacity={0.6}
                />
              );
            })}

            {/* Draw Nodes */}
            {positionedNodes.map((node) => (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
              >
                <circle
                  r={node.type === 'entity' ? 24 : 18}
                  fill={getColor(node.type)}
                  stroke="#1f2937"
                  strokeWidth={3}
                  className="transition-transform group-hover:scale-110"
                />
                <text
                  textAnchor="middle"
                  dy=".3em"
                  fill="#f3f4f6"
                  fontSize="9px"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {node.type === 'entity' ? 'IND' : node.type === 'report' ? 'REP' : 'CMP'}
                </text>
                <text
                  textAnchor="middle"
                  y={node.type === 'entity' ? 38 : 32}
                  fill="#9ca3af"
                  fontSize="9px"
                  className="pointer-events-none group-hover:fill-text font-semibold"
                >
                  {node.label.length > 15 ? `${node.label.substring(0, 12)}...` : node.label}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-surface/90 border border-border p-3 rounded-md text-[10px] space-y-1.5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ea580c]"></span>
            <span className="font-semibold text-text">Extracted Indicator</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]"></span>
            <span className="font-semibold text-text">Linked Report</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]"></span>
            <span className="font-semibold text-text">Campaign Alert</span>
          </div>
        </div>

        {/* Info Box Overlay */}
        {selectedNode && (
          <div className="absolute top-3 right-3 max-w-[200px] bg-surface/95 border border-border p-3 rounded-md text-[11px] space-y-2 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between border-b border-border pb-1">
              <span className="font-bold text-text uppercase tracking-wider">{selectedNode.type}</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-text-subtle hover:text-text font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-text font-mono truncate">{selectedNode.label}</p>
            {selectedNode.risk !== undefined && (
              <p className="text-text-muted">
                Risk Score:{' '}
                <span className="font-bold text-brand">{(selectedNode.risk * 100).toFixed(0)}%</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
