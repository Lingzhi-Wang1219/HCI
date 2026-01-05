

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Target, GameStats, Position, GameConfig } from '../types';
import { AlertTriangle, Flag, Settings } from 'lucide-react';

interface GameCanvasProps {
  config: GameConfig;
  onGameOver: (stats: GameStats) => void;
  onOpenSettings: () => void;
  isSettingsOpen: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ config, onGameOver, onOpenSettings, isSettingsOpen }) => {
  // Use config values for physics
  const TRACKER_RADIUS = (config.trackerSize / 2) + 20; 

  // Refs
  // Fix: Providing an initial value of null to satisfy the TypeScript requirement for 1 argument.
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  
  // Logic refs
  const trackerPosRef = useRef<Position>({ x: 0, y: 0 });
  const trackerVelocityRef = useRef<Position>({ x: config.trackerSpeed, y: config.trackerSpeed });
  const targetPhysicsRef = useRef<{x: number, y: number, vx: number, vy: number} | null>(null);
  
  const mousePosRef = useRef<Position>({ x: 0, y: 0 });
  const lastClickTimeRef = useRef<number>(Date.now()); 
  const lastLeftZoneTimeRef = useRef<number>(Date.now());
  
  // Ref for the latest config to avoid closure issues in animation frame
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
    // Update velocity when speed changes
    const currentV = trackerVelocityRef.current;
    const mag = Math.sqrt(currentV.x**2 + currentV.y**2);
    if (mag !== 0) {
      trackerVelocityRef.current = {
        x: (currentV.x / mag) * config.trackerSpeed,
        y: (currentV.y / mag) * config.trackerSpeed
      };
    }
  }, [config]);

  // Sync the pause state with the settings overlay visibility
  useEffect(() => {
    isPausedRef.current = isSettingsOpen;
  }, [isSettingsOpen]);

  // Scoring refs
  const timeOnTargetMsRef = useRef<number>(0);
  const totalFrameTimeMsRef = useRef<number>(0);
  const targetsClickedRef = useRef<number>(0);
  const targetsPresentedRef = useRef<number>(0);
  const reactionTimesRef = useRef<number[]>([]);
  
  // State
  const [target, setTarget] = useState<Target | null>(null); 
  const [showFocusWarning, setShowFocusWarning] = useState(false);
  
  // DOM Refs
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const trackerDivRef = useRef<HTMLDivElement>(null);
  const trackingRingRef = useRef<HTMLDivElement>(null);
  const targetBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (leftPanelRef.current) {
        const { clientWidth, clientHeight } = leftPanelRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
            trackerPosRef.current = { x: clientWidth / 2, y: clientHeight / 2 };
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const spawnTarget = useCallback(() => {
    if (!rightPanelRef.current) return;
    
    const { clientWidth, clientHeight } = rightPanelRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;
    
    const conf = configRef.current;
    const size = Math.floor(Math.random() * (conf.targetMaxSize - conf.targetMinSize + 1)) + conf.targetMinSize;
    const maxX = Math.max(0, clientWidth - size - 10);
    const maxY = Math.max(0, clientHeight - size - 10);
    const x = Math.random() * maxX + 5; 
    const y = Math.random() * maxY + 5;

    const angle = Math.random() * Math.PI * 2;
    const vx = Math.cos(angle) * conf.targetSpeed;
    const vy = Math.sin(angle) * conf.targetSpeed;

    const newTarget: Target = {
      id: Date.now(),
      x, y, vx, vy,
      spawnTime: Date.now(),
      size: size
    };

    targetPhysicsRef.current = { x, y, vx, vy };
    setTarget(newTarget);
    targetsPresentedRef.current += 1;
  }, []);

  const handleTargetClick = () => {
    if (!target) return;
    reactionTimesRef.current.push(Date.now() - target.spawnTime);
    targetsClickedRef.current += 1;
    setTarget(null);
    targetPhysicsRef.current = null;
    lastClickTimeRef.current = Date.now();
  };

  const handleFinish = useCallback(() => {
     const now = Date.now();
     const duration = (now - startTimeRef.current - pausedTimeRef.current) / 1000;
     const avgRT = reactionTimesRef.current.length > 0 
        ? reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length 
        : 0;
      const accuracy = totalFrameTimeMsRef.current > 0 
        ? (timeOnTargetMsRef.current / totalFrameTimeMsRef.current) * 100 
        : 0;

      onGameOver({
        durationSeconds: Math.floor(duration),
        primaryTaskAccuracy: accuracy,
        secondaryTargetsPresented: targetsPresentedRef.current,
        secondaryTargetsClicked: targetsClickedRef.current,
        avgReactionTimeMs: avgRT,
        clickPrecision: []
      });
  }, [onGameOver]);

  const updateGame = useCallback(() => {
    if (isPausedRef.current) {
      requestRef.current = requestAnimationFrame(updateGame);
      return;
    }

    if (!leftPanelRef.current || !trackerDivRef.current || !trackingRingRef.current) return;

    const conf = configRef.current;
    const now = Date.now();
    
    const leftRect = leftPanelRef.current.getBoundingClientRect();
    if (leftRect.width === 0 || leftRect.height === 0) {
        requestRef.current = requestAnimationFrame(updateGame);
        return;
    }

    // --- Warning Logic ---
    if (mousePosRef.current.x <= leftRect.right) {
        lastLeftZoneTimeRef.current = now;
        if (showFocusWarning) setShowFocusWarning(false);
    } else {
        if (now - lastLeftZoneTimeRef.current > conf.focusTimeoutMs) {
             if (!showFocusWarning) setShowFocusWarning(true);
        }
    }

    // --- Primary Task Physics ---
    let { x, y } = trackerPosRef.current;
    let { x: vx, y: vy } = trackerVelocityRef.current;
    
    x += vx;
    y += vy;
    const maxLeftX = leftRect.width - conf.trackerSize;
    const maxLeftY = leftRect.height - conf.trackerSize;

    if (x <= 0) { x = 0; vx = Math.abs(vx); }
    else if (x >= maxLeftX) { x = maxLeftX; vx = -Math.abs(vx); }
    if (y <= 0) { y = 0; vy = Math.abs(vy); }
    else if (y >= maxLeftY) { y = maxLeftY; vy = -Math.abs(vy); }

    trackerPosRef.current = { x, y };
    trackerVelocityRef.current = { x: vx, y: vy };
    trackerDivRef.current.style.transform = `translate(${x}px, ${y}px)`;

    // --- Accuracy Check ---
    const trackerGlobalX = leftRect.left + x + (conf.trackerSize / 2);
    const trackerGlobalY = leftRect.top + y + (conf.trackerSize / 2);
    const dx = mousePosRef.current.x - trackerGlobalX;
    const dy = mousePosRef.current.y - trackerGlobalY;
    const distance = Math.sqrt(dx*dx + dy*dy);
    const isOnTarget = distance < TRACKER_RADIUS;

    if (isOnTarget) {
      timeOnTargetMsRef.current += 16.67;
      trackingRingRef.current.style.borderColor = '#4ade80';
      trackingRingRef.current.style.opacity = '1';
    } else {
      trackingRingRef.current.style.borderColor = '#ef4444';
      trackingRingRef.current.style.opacity = '0.5';
    }
    trackingRingRef.current.style.transform = `translate(${x}px, ${y}px) scale(${isOnTarget ? 1.1 : 1})`;
    totalFrameTimeMsRef.current += 16.67;

    // --- Secondary Task Physics ---
    if (target && targetBtnRef.current && targetPhysicsRef.current && rightPanelRef.current) {
        const rightRect = rightPanelRef.current.getBoundingClientRect();
        let { x: tx, y: ty, vx: tvx, vy: tvy } = targetPhysicsRef.current;
        tx += tvx;
        ty += tvy;
        const maxRightX = rightRect.width - target.size;
        const maxRightY = rightRect.height - target.size;
        
        if (tx <= 0) { tx = 0; tvx = Math.abs(tvx); }
        else if (tx >= maxRightX) { tx = maxRightX; tvx = -Math.abs(tvx); }
        if (ty <= 0) { ty = 0; tvy = Math.abs(tvy); }
        else if (ty >= maxRightY) { ty = maxRightY; tvy = -Math.abs(tvy); }
        
        targetPhysicsRef.current = { x: tx, y: ty, vx: tvx, vy: tvy };
        targetBtnRef.current.style.transform = `translate(${tx}px, ${ty}px)`;
    }

    if (!target && (now - lastClickTimeRef.current > 800) && Math.random() < 0.02) {
      spawnTarget();
    } 

    requestRef.current = requestAnimationFrame(updateGame);
  }, [spawnTarget, target, showFocusWarning, TRACKER_RADIUS]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateGame]);

  // Enhanced Label Styling: Larger font (text-xl) and better alignment
  const labelBaseClasses = "absolute bottom-10 left-10 z-20 flex items-center gap-3 pointer-events-none select-none";
  const labelTextClasses = "text-xl font-black uppercase tracking-tight opacity-40 transition-opacity group-hover:opacity-60";

  return (
    <div 
      onMouseMove={e => { mousePosRef.current = { x: e.clientX, y: e.clientY }; }}
      className="relative w-full h-screen bg-slate-950 overflow-hidden flex select-none touch-none"
    >
      {/* Settings Toggle in Game - Fixed in Top Right */}
      <button 
        onClick={() => {
          onOpenSettings();
        }}
        className="absolute top-4 right-4 z-[60] p-3 bg-slate-800/80 hover:bg-blue-600 text-white rounded-full transition-all border border-slate-700 shadow-lg pointer-events-auto"
        title="Settings"
      >
        <Settings className="w-6 h-6" />
      </button>

      {showFocusWarning && (
        <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-16 pointer-events-none animate-bounce">
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 border-2 border-white/20">
                <AlertTriangle className="w-8 h-8" />
                <div className="text-xl font-bold uppercase tracking-tight">Attention Required: Primary Zone</div>
            </div>
        </div>
      )}

      {/* Action Button */}
      <button 
        onClick={handleFinish}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-full font-black text-xl shadow-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border-b-4 border-red-800"
      >
        <Flag className="w-6 h-6" />
        Finish Assessment
      </button>

      {/* --- Zone A: Primary Task --- */}
      <div 
        ref={leftPanelRef}
        style={{ width: `${config.leftZoneWidth}%` }}
        className={`relative h-full border-r-2 border-slate-700 transition-all duration-500 ${showFocusWarning ? 'bg-red-900/20' : 'bg-slate-900/50'} cursor-crosshair group`}
      >
        {/* Unified Label - Large & Aligned */}
        <div className={labelBaseClasses}>
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
          <span className={`${labelTextClasses} text-blue-400`}>Primary Task</span>
        </div>

        <div 
          ref={trackerDivRef}
          className="absolute rounded-full bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,1)] pointer-events-none z-10"
          style={{ 
            width: config.trackerSize, 
            height: config.trackerSize, 
            willChange: 'transform',
            transition: 'width 0.2s, height 0.2s'
          }}
        />
        
        <div
          ref={trackingRingRef}
          className="absolute rounded-full border-4 border-red-500 pointer-events-none z-10"
          style={{ 
            width: TRACKER_RADIUS * 2, 
            height: TRACKER_RADIUS * 2,
            marginTop: -(TRACKER_RADIUS - config.trackerSize/2), 
            marginLeft: -(TRACKER_RADIUS - config.trackerSize/2), 
            willChange: 'transform'
          }}
        />
      </div>

      {/* --- Zone B: Secondary Task --- */}
      <div 
        ref={rightPanelRef}
        style={{ width: `${100 - config.leftZoneWidth}%` }}
        className="relative h-full bg-slate-900 cursor-default transition-all duration-500 group"
      >
         {/* Unified Label - Large & Perfectly Aligned with the Left one */}
         <div className={labelBaseClasses}>
           <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
           <span className={`${labelTextClasses} text-amber-400`}>Secondary Task</span>
         </div>

        {target && (
          <button
            ref={targetBtnRef}
            onMouseDown={handleTargetClick}
            className="absolute bg-amber-500 border-4 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)] hover:bg-amber-400 active:scale-95 cursor-pointer z-30"
            style={{ 
              top: 0, left: 0,
              width: target.size, height: target.size,
              borderRadius: '8px'
            }}
          >
            <div className="w-full h-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')]"></div>
          </button>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;