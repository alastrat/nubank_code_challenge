import { describe, it, expect, beforeEach } from 'vitest';
import { StockPosition } from '../../src/entities/StockPosition';
import { StockOperation } from '../../src/entities/StockOperation';

describe('StockPosition', () => {
  it('should create a stock position with default values', () => {
    const position = new StockPosition();
    expect(position.quantity).toBe(0);
    expect(position.weightedAveragePrice).toBe(0);
    expect(position.accumulatedLoss).toBe(0);
  });

  it('should create a stock position with provided values', () => {
    const position = new StockPosition(100, 10.0, 50.0);
    expect(position.quantity).toBe(100);
    expect(position.weightedAveragePrice).toBe(10.0);
    expect(position.accumulatedLoss).toBe(50.0);
  });

  it('should update position for buy operation', () => {
    const position = new StockPosition();
    const operation = new StockOperation('buy', 10.0, 100);
    
    position.updatePosition(operation);
    
    expect(position.quantity).toBe(100);
    expect(position.weightedAveragePrice).toBe(10.0);
  });

  it('should update position for multiple buy operations with weighted average', () => {
    const position = new StockPosition();
    const operation1 = new StockOperation('buy', 10.0, 100);
    const operation2 = new StockOperation('buy', 15.0, 50);
    
    position.updatePosition(operation1);
    position.updatePosition(operation2);
    
    // (100*10 + 50*15) / 150 = 11.67
    expect(position.quantity).toBe(150);
    expect(position.weightedAveragePrice).toBeCloseTo(11.67, 2);
  });

  it('should update position for sell operation', () => {
    const position = new StockPosition(100, 10.0, 0);
    const operation = new StockOperation('sell', 15.0, 50);
    
    position.updatePosition(operation);
    
    expect(position.quantity).toBe(50);
    expect(position.weightedAveragePrice).toBe(10.0); // Remains the same
  });

  it('should reset weighted average price when quantity becomes zero', () => {
    const position = new StockPosition(100, 10.0, 0);
    const operation = new StockOperation('sell', 15.0, 100);
    
    position.updatePosition(operation);
    
    expect(position.quantity).toBe(0);
    expect(position.weightedAveragePrice).toBe(0);
  });

  it('should calculate profit correctly for sell operation', () => {
    const position = new StockPosition(100, 10.0, 0);
    const operation = new StockOperation('sell', 15.0, 50);
    
    const profit = position.calculateProfit(operation);
    
    // (15 - 10) * 50 = 250
    expect(profit).toBe(250);
  });

  it('should calculate loss correctly for sell operation', () => {
    const position = new StockPosition(100, 15.0, 0);
    const operation = new StockOperation('sell', 10.0, 50);
    
    const profit = position.calculateProfit(operation);
    
    // (10 - 15) * 50 = -250
    expect(profit).toBe(-250);
  });

  it('should reset position', () => {
    const position = new StockPosition(100, 10.0, 50.0);
    
    position.reset();
    
    expect(position.quantity).toBe(0);
    expect(position.weightedAveragePrice).toBe(0);
    expect(position.accumulatedLoss).toBe(0);
  });

  describe('updatePosition with insufficient shares', () => {
    it('should throw an error when trying to sell more shares than available', () => {
      const position = new StockPosition(100, 10.0, 0); // Start with 100 shares
      const sellOperation = new StockOperation('sell', 15.0, 150); // Try to sell 150

      expect(() => position.updatePosition(sellOperation)).toThrowError(
        'Insufficient shares to complete the sell operation.'
      );

      // Ensure position state remains unchanged after the error
      expect(position.quantity).toBe(100);
      expect(position.weightedAveragePrice).toBe(10.0);
    });
  });

  describe('error counting and blocking', () => {
    let position: StockPosition;

    beforeEach(() => {
      position = new StockPosition();
    });

    it('should initialize with an errorCount of 0 and not blocked', () => {
      expect(position.errorCount).toBe(0);
      expect(position.isBlocked()).toBe(false);
    });

    it('should increment errorCount', () => {
      position.incrementErrorCount();
      expect(position.errorCount).toBe(1);
      position.incrementErrorCount();
      expect(position.errorCount).toBe(2);
    });

    it('should not be blocked after 1 or 2 errors', () => {
      position.incrementErrorCount(); // 1st error
      expect(position.isBlocked()).toBe(false);
      position.incrementErrorCount(); // 2nd error
      expect(position.isBlocked()).toBe(false);
    });

    it('should be blocked after 3 errors', () => {
      position.incrementErrorCount(); // 1st
      position.incrementErrorCount(); // 2nd
      position.incrementErrorCount(); // 3rd
      expect(position.errorCount).toBe(3);
      expect(position.isBlocked()).toBe(true);
    });

    it('should remain blocked after more than 3 errors', () => {
      position.incrementErrorCount(); // 1st
      position.incrementErrorCount(); // 2nd
      position.incrementErrorCount(); // 3rd
      position.incrementErrorCount(); // 4th
      expect(position.errorCount).toBe(4);
      expect(position.isBlocked()).toBe(true);
    });

    it('reset() should reset errorCount to 0', () => {
      position.incrementErrorCount();
      position.incrementErrorCount();
      position.incrementErrorCount();
      expect(position.isBlocked()).toBe(true);
      position.reset();
      expect(position.errorCount).toBe(0);
      expect(position.isBlocked()).toBe(false);
    });
  });
}); 