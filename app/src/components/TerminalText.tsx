"use client";

import React, { useState, useEffect, useRef } from "react";

interface TerminalTextProps {
  text: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function TerminalText({
  text,
  speed = 30,
  delay = 0,
  cursor = true,
  onComplete,
  className = "",
}: TerminalTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);

  // Keep ref in sync without re-triggering effect
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      setDone(true);
      onCompleteRef.current?.();
      return;
    }
    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(timer);
  }, [started, displayed, text, speed]);

  return (
    <span className={`font-mono ${className}`}>
      {displayed}
      {cursor && !done && (
        <span className="inline-block w-2 h-4 bg-sentinel-cyan ml-0.5 animate-cursor-blink align-middle" />
      )}
    </span>
  );
}
