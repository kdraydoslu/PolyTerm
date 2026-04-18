import { Market } from '../types';

export interface StrategySignal {
  score: number;
  confidence: number;
  direction: 'UP' | 'DOWN' | 'NEUTRAL';
  indicators: {
    delta: number;
    momentum: number;
    acceleration: number;
    ema: number;
    rsi: number;
    volume: number;
    tick: number;
  };
}

export class StrategyEngine {
  // Constants for interval calculation
  static FIVE_MIN = 300;
  static FIFTEEN_MIN = 900;

  static getWindowInfo(interval: number = 300) {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - (now % interval);
    const windowEnd = windowStart + interval;
    const timeLeft = windowEnd - now;
    
    return {
      windowStart,
      windowEnd,
      timeLeft,
      slug: `btc-updown-${interval === 300 ? '5m' : '15m'}-${windowStart}`
    };
  }

  static calculateSignal(currentPrice: number, openPrice: number, history: any[]): StrategySignal {
    const windowDeltaPct = ((currentPrice - openPrice) / openPrice) * 100;
    
    let score = 0;
    const indicators = {
      delta: 0,
      momentum: 0,
      acceleration: 0,
      ema: 0,
      rsi: 0,
      volume: 0,
      tick: 0
    };

    // 1. Window Delta (Weight 7)
    if (Math.abs(windowDeltaPct) > 0.10) indicators.delta = (windowDeltaPct > 0 ? 7 : -7);
    else if (Math.abs(windowDeltaPct) > 0.02) indicators.delta = (windowDeltaPct > 0 ? 5 : -5);
    else if (Math.abs(windowDeltaPct) > 0.005) indicators.delta = (windowDeltaPct > 0 ? 3 : -3);
    else if (Math.abs(windowDeltaPct) > 0.001) indicators.delta = (windowDeltaPct > 0 ? 1 : -1);
    
    score += indicators.delta;

    // 2. Mocking other indicators for UI demonstration (Real indicators require more depth data)
    // In a real implementation, we'd pass Binance candle data here.
    indicators.momentum = (Math.random() - 0.5) * 4; // Mock [-2, 2]
    indicators.acceleration = (Math.random() - 0.5) * 3; // Mock [-1.5, 1.5]
    indicators.tick = (windowDeltaPct > 0 ? 1 : -1) * (Math.random() * 2);
    
    score += indicators.momentum + indicators.acceleration + indicators.tick;

    const confidence = Math.min(Math.abs(score) / 7.0, 1.0);
    const direction = score > 0.5 ? 'UP' : score < -0.5 ? 'DOWN' : 'NEUTRAL';

    return {
      score,
      confidence,
      direction,
      indicators
    };
  }

  // Calculate simulated token price based on the delta
  static getSimulatedPrice(deltaPct: number) {
    const absDelta = Math.abs(deltaPct);
    if (absDelta < 0.005) return 0.50;
    if (absDelta < 0.02) return 0.55;
    if (absDelta < 0.05) return 0.65;
    if (absDelta < 0.10) return 0.80;
    return 0.95;
  }
}
