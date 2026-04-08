"use client";

import React, { useEffect, useState, useRef } from "react";

const centerNode = { x: 350, y: 200, label: "Sentinel", type: "core" as const };

const agentNodes = [
  { x: 100, y: 80, label: "Agent 1", status: "active" as const, delay: 0 },
  { x: 80, y: 200, label: "Agent 2", status: "active" as const, delay: 0.8 },
  { x: 100, y: 320, label: "Agent 3", status: "arrested" as const, delay: 1.6 },
];

const daoNodes = [
  { x: 600, y: 80, label: "Voter 1", delay: 0.4 },
  { x: 620, y: 200, label: "Voter 2", delay: 1.2 },
  { x: 600, y: 320, label: "Voter 3", delay: 2.0 },
];

const statusColors = {
  active: "#00E5CC",
  arrested: "#FF0033",
  paroled: "#FF9B26",
};

export function NetworkGraph() {
  const [activeConnections, setActiveConnections] = useState<number[]>([]);
  const [packets, setPackets] = useState<{ id: number; from: number; type: string }[]>([]);
  const packetIdRef = useRef(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    agentNodes.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setActiveConnections((prev) => [...prev, i]);
        }, 600 + i * 700)
      );
    });
    daoNodes.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setActiveConnections((prev) => [...prev, i + 10]);
        }, 800 + i * 700)
      );
    });

    const packetInterval = setInterval(() => {
      const fromIdx = Math.floor(Math.random() * 3);
      const type = Math.random() > 0.5 ? "agent" : "dao";
      packetIdRef.current += 1;
      const id = packetIdRef.current;
      setPackets((prev) => {
        const next = [...prev, { id, from: fromIdx, type }];
        if (next.length > 8) next.shift();
        return next;
      });
    }, 1200);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(packetInterval);
    };
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <svg viewBox="0 0 700 400" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="flowGradientCyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E5CC" stopOpacity="0" />
            <stop offset="40%" stopColor="#00E5CC" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#00E5CC" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="flowGradientOrange" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF9B26" stopOpacity="0" />
            <stop offset="40%" stopColor="#FF9B26" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF9B26" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5CC" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00E5CC" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={centerNode.x} cy={centerNode.y} r="120" fill="url(#centerGlow)" />

        <circle cx={centerNode.x} cy={centerNode.y} r="60" fill="none" stroke="#1E2140" strokeWidth="0.5" opacity="0.5" style={{ animation: "ringPulse 4s ease-in-out infinite" }} />
        <circle cx={centerNode.x} cy={centerNode.y} r="100" fill="none" stroke="#1E2140" strokeWidth="0.5" opacity="0.3" style={{ animation: "ringPulse 5s ease-in-out infinite 1s" }} />

        {agentNodes.map((agent, i) => {
          const isActive = activeConnections.includes(i);
          return (
            <g key={`agent-line-${i}`}>
              <line x1={agent.x} y1={agent.y} x2={centerNode.x} y2={centerNode.y} stroke="#1E2140" strokeWidth="1" opacity="0.4" />
              {isActive && (
                <line x1={agent.x} y1={agent.y} x2={centerNode.x} y2={centerNode.y} stroke={statusColors[agent.status]} strokeWidth="1.5" opacity="0.6" strokeDasharray="500" style={{ animation: `flowPulse ${3 + i * 0.5}s linear infinite` }} />
              )}
            </g>
          );
        })}

        {daoNodes.map((dao, i) => {
          const isActive = activeConnections.includes(i + 10);
          return (
            <g key={`dao-line-${i}`}>
              <line x1={centerNode.x} y1={centerNode.y} x2={dao.x} y2={dao.y} stroke="#1E2140" strokeWidth="1" opacity="0.4" />
              {isActive && (
                <line x1={centerNode.x} y1={centerNode.y} x2={dao.x} y2={dao.y} stroke="#FF9B26" strokeWidth="1.5" opacity="0.6" strokeDasharray="500" style={{ animation: `flowPulseReverse ${3.5 + i * 0.5}s linear infinite` }} />
              )}
            </g>
          );
        })}

        {packets.map((pkt) => {
          const isAgent = pkt.type === "agent";
          const src = isAgent ? agentNodes[pkt.from] : centerNode;
          const dst = isAgent ? centerNode : daoNodes[pkt.from];
          const color = isAgent ? "#00E5CC" : "#FF9B26";
          return (
            <circle key={pkt.id} r="3" fill={color} filter="url(#glow)" style={{ offsetPath: `path('M ${src.x} ${src.y} L ${dst.x} ${dst.y}')`, animation: `dataPacket 2s ease-in-out forwards` }} />
          );
        })}

        <g filter="url(#glowStrong)">
          <circle cx={centerNode.x} cy={centerNode.y} r="32" fill="#111327" stroke="#00E5CC" strokeWidth="2" />
          <path d={`M ${centerNode.x} ${centerNode.y - 14} l 12 4 v 8 c 0 6 -6 10 -12 14 c -6 -4 -12 -8 -12 -14 v -8 z`} fill="none" stroke="#00E5CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={centerNode.x} cy={centerNode.y - 2} r="2.5" fill="#00E5CC" />
          <rect x={centerNode.x - 1} y={centerNode.y} width="2" height="5" rx="0.5" fill="#00E5CC" />
        </g>
        <text x={centerNode.x} y={centerNode.y + 48} textAnchor="middle" fill="#00E5CC" fontSize="10" fontWeight="600" fontFamily="var(--font-geist-mono)" letterSpacing="0.15em">
          SENTINEL
        </text>

        {agentNodes.map((agent, i) => {
          const isActive = activeConnections.includes(i);
          const color = statusColors[agent.status];
          return (
            <g key={`agent-${i}`} style={{ animation: isActive ? `nodeGlow 3s ease-in-out infinite ${i * 0.5}s` : "none" }}>
              <circle cx={agent.x} cy={agent.y} r="18" fill="#111327" stroke={color} strokeWidth="1.5" opacity={isActive ? 1 : 0.4} />
              <rect x={agent.x - 7} y={agent.y - 7} width="14" height="14" rx="2" fill="none" stroke={color} strokeWidth="1" opacity={isActive ? 0.8 : 0.3} />
              <circle cx={agent.x} cy={agent.y} r="2" fill={color} opacity={isActive ? 1 : 0.3} />
              <line x1={agent.x - 7} y1={agent.y - 3} x2={agent.x - 11} y2={agent.y - 3} stroke={color} strokeWidth="1" opacity="0.4" />
              <line x1={agent.x - 7} y1={agent.y + 3} x2={agent.x - 11} y2={agent.y + 3} stroke={color} strokeWidth="1" opacity="0.4" />
              <line x1={agent.x + 7} y1={agent.y - 3} x2={agent.x + 11} y2={agent.y - 3} stroke={color} strokeWidth="1" opacity="0.4" />
              <line x1={agent.x + 7} y1={agent.y + 3} x2={agent.x + 11} y2={agent.y + 3} stroke={color} strokeWidth="1" opacity="0.4" />
              <text x={agent.x} y={agent.y + 32} textAnchor="middle" fill={color} fontSize="8" fontWeight="500" opacity={isActive ? 0.9 : 0.4} fontFamily="var(--font-geist-mono)" letterSpacing="0.1em">
                {agent.label.toUpperCase()}
              </text>
              <circle cx={agent.x + 14} cy={agent.y - 14} r="3" fill={color} style={{ animation: isActive ? "statusBlink 1.5s ease-in-out infinite" : "none" }} />
            </g>
          );
        })}

        {daoNodes.map((dao, i) => {
          const isActive = activeConnections.includes(i + 10);
          return (
            <g key={`dao-${i}`} style={{ animation: isActive ? `nodeGlow 3s ease-in-out infinite ${i * 0.5 + 0.3}s` : "none" }}>
              <circle cx={dao.x} cy={dao.y} r="18" fill="#111327" stroke="#FF9B26" strokeWidth="1.5" opacity={isActive ? 1 : 0.4} />
              <circle cx={dao.x} cy={dao.y - 4} r="4" fill="none" stroke="#FF9B26" strokeWidth="1" opacity={isActive ? 0.8 : 0.3} />
              <path d={`M ${dao.x - 7} ${dao.y + 8} a 7 7 0 0 1 14 0`} fill="none" stroke="#FF9B26" strokeWidth="1" opacity={isActive ? 0.8 : 0.3} />
              <text x={dao.x} y={dao.y + 32} textAnchor="middle" fill="#FF9B26" fontSize="8" fontWeight="500" opacity={isActive ? 0.9 : 0.4} fontFamily="var(--font-geist-mono)" letterSpacing="0.1em">
                {dao.label.toUpperCase()}
              </text>
              <circle cx={dao.x + 14} cy={dao.y - 14} r="3" fill="#FF9B26" style={{ animation: isActive ? "statusBlink 2s ease-in-out infinite" : "none" }} />
            </g>
          );
        })}

        <text x="90" y="380" textAnchor="middle" fill="#00E5CC" fontSize="9" fontWeight="600" opacity="0.4" fontFamily="var(--font-geist-mono)" letterSpacing="0.2em">
          AI OPERATIVES
        </text>
        <text x="610" y="380" textAnchor="middle" fill="#FF9B26" fontSize="9" fontWeight="600" opacity="0.4" fontFamily="var(--font-geist-mono)" letterSpacing="0.2em">
          WAR COUNCIL
        </text>
      </svg>
    </div>
  );
}
