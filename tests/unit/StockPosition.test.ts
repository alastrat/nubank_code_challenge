import { describe, it, expect, beforeEach } from 'vitest';
import { StockPosition } from '../../src/entities/StockPosition';
import { StockOperation } from '../../src/entities/StockOperation';

describe('StockPosition', () => {
  it('should create a stock position with default values', () => {
    const position = new StockPosition();
    expect(position.getQuantityForSymbol('ANY_SYMBOL')).toBe(0);
    expect(position.getWAPForSymbol('ANY_SYMBOL')).toBe(0.0);
    expect(position.accumulatedLoss).toBe(0.0);
    expect(position.errorCount).toBe(0);
  });

  describe('per-symbol tracking', () => {
    let position: StockPosition;
    const sym1 = 'AAPL';
    const sym2 = 'GOOG';

    beforeEach(() => {
      position = new StockPosition();
    });

    it('should initialize with empty quantities and WAPs for any symbol', () => {
      expect(position.getQuantityForSymbol(sym1)).toBe(0);
      expect(position.getWAPForSymbol(sym1)).toBe(0.0);
      expect(position.getQuantityForSymbol(sym2)).toBe(0);
      expect(position.getWAPForSymbol(sym2)).toBe(0.0);
    });

    it('should update position for a buy operation for a specific symbol', () => {
      const op = new StockOperation('buy', 100, 10, sym1);
      position.updatePosition(op);
      expect(position.getQuantityForSymbol(sym1)).toBe(10);
      expect(position.getWAPForSymbol(sym1)).toBe(100);
      expect(position.getQuantityForSymbol(sym2)).toBe(0); // Other symbols unaffected
    });

    it('should update WAP correctly for multiple buys of the same symbol', () => {
      position.updatePosition(new StockOperation('buy', 100, 10, sym1));
      position.updatePosition(new StockOperation('buy', 110, 10, sym1));
      expect(position.getQuantityForSymbol(sym1)).toBe(20);
      expect(position.getWAPForSymbol(sym1)).toBe(105); // (100*10 + 110*10) / 20
    });

    it('should handle buy operations for different symbols independently', () => {
      position.updatePosition(new StockOperation('buy', 100, 10, sym1));
      position.updatePosition(new StockOperation('buy', 200, 5, sym2));
      expect(position.getQuantityForSymbol(sym1)).toBe(10);
      expect(position.getWAPForSymbol(sym1)).toBe(100);
      expect(position.getQuantityForSymbol(sym2)).toBe(5);
      expect(position.getWAPForSymbol(sym2)).toBe(200);
    });

    it('should update position for a sell operation for a specific symbol', () => {
      position.updatePosition(new StockOperation('buy', 100, 10, sym1));
      position.updatePosition(new StockOperation('sell', 110, 5, sym1));
      expect(position.getQuantityForSymbol(sym1)).toBe(5);
      expect(position.getWAPForSymbol(sym1)).toBe(100); // WAP doesn't change on sell
    });

    it('should reset WAP for a symbol when its quantity becomes zero after a sell', () => {
      position.updatePosition(new StockOperation('buy', 100, 10, sym1));
      position.updatePosition(new StockOperation('sell', 110, 10, sym1));
      expect(position.getQuantityForSymbol(sym1)).toBe(0);
      expect(position.getWAPForSymbol(sym1)).toBe(0.0);
    });

    it('should handle sell operations for different symbols independently', () => {
      position.updatePosition(new StockOperation('buy', 100, 10, sym1));
      position.updatePosition(new StockOperation('buy', 200, 5, sym2));
      position.updatePosition(new StockOperation('sell', 110, 3, sym1));
      position.updatePosition(new StockOperation('sell', 210, 2, sym2));

      expect(position.getQuantityForSymbol(sym1)).toBe(7);
      expect(position.getWAPForSymbol(sym1)).toBe(100);
      expect(position.getQuantityForSymbol(sym2)).toBe(3);
      expect(position.getWAPForSymbol(sym2)).toBe(200);
    });

    it('should throw error for insufficient shares of a specific symbol and name the symbol', () => {
      position.updatePosition(new StockOperation('buy', 100, 5, sym1));
      const sellOp = new StockOperation('sell', 110, 10, sym1);
      expect(() => position.updatePosition(sellOp)).toThrowError(
        `Insufficient shares of ${sym1} to complete the sell operation. Have: 5, Need: 10`
      );
      expect(position.getQuantityForSymbol(sym1)).toBe(5); // State unchanged for sym1
      expect(position.errorCount).toBe(0); // StockPosition itself doesn't increment errorCount
    });
    
    it('should not change state of other symbols when one symbol has insufficient shares error', () => {
      position.updatePosition(new StockOperation('buy', 100, 10, sym1));
      position.updatePosition(new StockOperation('buy', 200, 5, sym2));
      const sellOpSym1 = new StockOperation('sell', 110, 15, sym1); // Not enough SYM1

      expect(() => position.updatePosition(sellOpSym1)).toThrowError();
      expect(position.getQuantityForSymbol(sym1)).toBe(10);
      expect(position.getWAPForSymbol(sym1)).toBe(100);
      expect(position.getQuantityForSymbol(sym2)).toBe(5); // SYM2 state should be unchanged
      expect(position.getWAPForSymbol(sym2)).toBe(200);
    });

    it('should calculate profit correctly for a specific symbol', () => {
      position.updatePosition(new StockOperation('buy', 100, 10, sym1));
      const sellOp = new StockOperation('sell', 120, 5, sym1);
      const profit = position.calculateProfit(sellOp);
      expect(profit).toBe(100); // (120 - 100) * 5
    });

    it('should calculate loss correctly for a specific symbol', () => {
      position.updatePosition(new StockOperation('buy', 100, 10, sym1));
      const sellOp = new StockOperation('sell', 80, 5, sym1);
      const profit = position.calculateProfit(sellOp);
      expect(profit).toBe(-100); // (80 - 100) * 5
    });

    it('reset() should clear all per-symbol quantities, WAPs, and global stats', () => {
      position.updatePosition(new StockOperation('buy', 100, 10, sym1));
      position.updatePosition(new StockOperation('buy', 200, 5, sym2));
      position.accumulatedLoss = 50; // Set some global state
      position.incrementErrorCount(); // Increment global error count

      position.reset();

      expect(position.getQuantityForSymbol(sym1)).toBe(0);
      expect(position.getWAPForSymbol(sym1)).toBe(0.0);
      expect(position.getQuantityForSymbol(sym2)).toBe(0);
      expect(position.getWAPForSymbol(sym2)).toBe(0.0);
      expect(position.accumulatedLoss).toBe(0.0);
      expect(position.errorCount).toBe(0);
    });

    it('should throw error if operation symbol (title) is missing during updatePosition', () => {
      const op = new StockOperation('buy', 100, 10, undefined as any); // Cast to any to bypass TS check for test
      expect(() => position.updatePosition(op)).toThrowError('Operation title (symbol) is missing.');
    });

    it('should throw error if operation symbol (title) is missing during calculateProfit', () => {
      const op = new StockOperation('sell', 100, 10, undefined as any); // Cast to any
      expect(() => position.calculateProfit(op)).toThrowError('Operation title (symbol) is missing for profit calculation.');
    });

    it('getQuantityForSymbol() and getWAPForSymbol() should return 0 for unknown symbols', () => {
      expect(position.getQuantityForSymbol('UNKNOWN_SYMBOL')).toBe(0);
      expect(position.getWAPForSymbol('UNKNOWN_SYMBOL')).toBe(0.0);
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
      position.incrementErrorCount();
      expect(position.isBlocked()).toBe(false);
      position.incrementErrorCount();
      expect(position.isBlocked()).toBe(false);
    });

    it('should be blocked after 3 errors', () => {
      position.incrementErrorCount();
      position.incrementErrorCount();
      position.incrementErrorCount();
      expect(position.errorCount).toBe(3);
      expect(position.isBlocked()).toBe(true);
    });

    it('should remain blocked after more than 3 errors', () => {
      position.incrementErrorCount();
      position.incrementErrorCount();
      position.incrementErrorCount();
      position.incrementErrorCount(); 
      expect(position.errorCount).toBe(4);
      expect(position.isBlocked()).toBe(true);
    });

    it('reset() should reset errorCount to 0 and clear relevant symbol data', () => {
      position.updatePosition(new StockOperation('buy', 100, 10, 'SYM_AFFECTED_BY_RESET'));
      position.incrementErrorCount();
      position.incrementErrorCount();
      position.incrementErrorCount();
      expect(position.isBlocked()).toBe(true);
      expect(position.getQuantityForSymbol('SYM_AFFECTED_BY_RESET')).toBe(10);

      position.reset();
      
      expect(position.errorCount).toBe(0);
      expect(position.isBlocked()).toBe(false);
      expect(position.getQuantityForSymbol('SYM_AFFECTED_BY_RESET')).toBe(0); 
      expect(position.accumulatedLoss).toBe(0.0); 
    });
  });
}); 