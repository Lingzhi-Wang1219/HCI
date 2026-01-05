export interface Position {
  x: number;
  y: number;
}

export interface Target {
  id: number;
  x: number;
  y: number;
  vx: number; 
  vy: number;
  spawnTime: number;
  size: number; 
}

export interface GameConfig {
  leftZoneWidth: number; // 1-99 percentage
  trackerSize: number;   // pixels
  trackerSpeed: number;  // movement factor
  targetMinSize: number; // pixels
  targetMaxSize: number; // pixels
  targetSpeed: number;   // movement factor
  focusTimeoutMs: number; // milliseconds
}

export interface GameStats {
  durationSeconds: number;
  primaryTaskAccuracy: number; 
  secondaryTargetsPresented: number;
  secondaryTargetsClicked: number;
  avgReactionTimeMs: number;
  clickPrecision: number[]; 
}

export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
}