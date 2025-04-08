import { describe, it, expect } from 'vitest';
import { CapitalGainsController } from '../../src/controllers/CapitalGainsController';

describe('Capital Gains Integration Tests', () => {
  // For each test case, we'll directly test the processSimulation method of the controller
  // This gives us controlled input/output without mocking stdin/stdout

  it('Test Case 1: Basic buy/sell with no tax (amount ≤ $20,000)', () => {
    const controller = new CapitalGainsController();
    const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 100},{"operation":"sell", "unit-cost":15.00, "quantity": 50},{"operation":"sell", "unit-cost":15.00, "quantity": 50}]';
    
    // @ts-ignore - accessing private method for integration testing
    const result = controller.processSimulation(input);
    
    expect(result).toEqual([
      { tax: 0.0 },
      { tax: 0.0 },
      { tax: 0.0 }
    ]);
  });

  it('Test Case 2: High-value operations with tax calculation (amount > $20,000)', () => {
    const controller = new CapitalGainsController();
    const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":20.00, "quantity": 5000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000}]';
    
    // @ts-ignore - accessing private method for integration testing
    const result = controller.processSimulation(input);
    
    expect(result).toEqual([
      { tax: 0.0 },
      { tax: 10000.0 },
      { tax: 0.0 }
    ]);
  });

  it('Test Case 3: Operations just below tax threshold ($20,000)', () => {
    const controller = new CapitalGainsController();
    const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 1000},{"operation":"sell", "unit-cost":20.00, "quantity": 1000}]';
    
    // @ts-ignore - accessing private method for integration testing
    const result = controller.processSimulation(input);
    
    // Total amount: 20.00 * 1000 = 20000 (exactly at threshold, no tax)
    expect(result).toEqual([
      { tax: 0.0 },
      { tax: 0.0 }
    ]);
  });

  it('Test Case 4: Loss handling and accumulation', () => {
    const controller = new CapitalGainsController();
    const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"buy", "unit-cost":25.00, "quantity": 5000},{"operation":"sell", "unit-cost":15.00, "quantity": 10000}]';
    
    // @ts-ignore - accessing private method for integration testing
    const result = controller.processSimulation(input);
    
    // Weighted average: (10*10000 + 25*5000) / 15000 = 15
    // No profit/loss on selling at 15, so no tax
    expect(result).toEqual([
      { tax: 0.0 },
      { tax: 0.0 },
      { tax: 0.0 }
    ]);
  });

  it('Test Case 5: Multiple profitable operations with tax', () => {
    const controller = new CapitalGainsController();
    const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":50.00, "quantity": 10000}]';
    
    // @ts-ignore - accessing private method for integration testing
    const result = controller.processSimulation(input);
    
    // Profit: (50-10) * 10000 = 400,000, Tax = 400,000 * 0.2 = 80,000
    expect(result).toEqual([
      { tax: 0.0 },
      { tax: 80000.0 }
    ]);
  });

  it('Test Case 6: Using accumulated losses to offset future profits', () => {
    const controller = new CapitalGainsController();
    const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000},{"operation":"sell", "unit-cost":20.00, "quantity": 3000}]';
    
    // @ts-ignore - accessing private method for integration testing
    const result = controller.processSimulation(input);
    
    // First sell: Loss of (5-10) * 5000 = -25,000, accumulated
    // Second sell: Profit of (20-10) * 3000 = 30,000, offset by 25,000
    // Taxable profit: 5,000, Tax = 5,000 * 0.2 = 1,000
    expect(result).toEqual([
      { tax: 0.0 },
      { tax: 0.0 },
      { tax: 1000.0 }
    ]);
  });

  it('Test Case 7: Complex sequence with mixed profits and losses', () => {
    const controller = new CapitalGainsController();
    const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":2.00, "quantity": 5000},{"operation":"sell", "unit-cost":20.00, "quantity": 2000},{"operation":"sell", "unit-cost":20.00, "quantity": 2000},{"operation":"sell", "unit-cost":25.00, "quantity": 1000},{"operation":"buy", "unit-cost":20.00, "quantity": 10000},{"operation":"sell", "unit-cost":15.00, "quantity": 5000},{"operation":"sell", "unit-cost":30.00, "quantity": 4350},{"operation":"sell", "unit-cost":30.00, "quantity": 650}]';
    
    // @ts-ignore - accessing private method for integration testing
    const result = controller.processSimulation(input);
    
    // Now get the actual result and validate it
    expect(result).toHaveLength(9);
    expect(result[0]).toEqual({ tax: 0.0 });  // Buy
    expect(result[1]).toEqual({ tax: 0.0 });  // Sell at a loss
    expect(result[2]).toEqual({ tax: 0.0 });  // Sell at a profit but loss accumulation
    expect(result[3]).toEqual({ tax: 0.0 });  // Sell at a profit but loss accumulation
    expect(result[4]).toEqual({ tax: 3000.0 }); // Sell at a profit with calculated tax
    expect(result[5]).toEqual({ tax: 0.0 });  // Buy
    expect(result[6]).toEqual({ tax: 0.0 });  // Sell at a loss
    expect(result[7]).toEqual({ tax: 3700.0 }); // Sell at a profit
    expect(result[8]).toEqual({ tax: 0.0 });  // Last operation
  });

  it('Test Case 8: Very high value operations (>$100,000)', () => {
    const controller = new CapitalGainsController();
    const input = '[{"operation":"buy", "unit-cost":1000.00, "quantity": 100},{"operation":"sell", "unit-cost":2000.00, "quantity": 50},{"operation":"sell", "unit-cost":3000.00, "quantity": 50}]';
    
    // @ts-ignore - accessing private method for integration testing
    const result = controller.processSimulation(input);
    
    // First sell: (2000-1000) * 50 = 50,000 profit, Tax = 50,000 * 0.2 = 10,000
    // Second sell: (3000-1000) * 50 = 100,000 profit, Tax = 100,000 * 0.2 = 20,000
    expect(result).toEqual([
      { tax: 0.0 },
      { tax: 10000.0 },
      { tax: 20000.0 }
    ]);
  });

  it('Test Case 9: Progressive profit/loss scenarios with tax implications', () => {
    const controller = new CapitalGainsController();
    const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000},{"operation":"sell", "unit-cost":15.00, "quantity": 2000},{"operation":"sell", "unit-cost":15.00, "quantity": 3000}]';
    
    // @ts-ignore - accessing private method for integration testing
    const result = controller.processSimulation(input);
    
    // First sell: Loss of (5-10) * 5000 = -25,000
    // Second sell: Profit of (15-10) * 2000 = 10,000, below threshold
    // Third sell: Profit of (15-10) * 3000 = 15,000, below threshold
    expect(result).toEqual([
      { tax: 0.0 },
      { tax: 0.0 },
      { tax: 0.0 },
      { tax: 0.0 }
    ]);
  });

  it('Multiple simulations in a single input', () => {
    const controller = new CapitalGainsController();
    
    // Test case 1 and 2 combined
    const input1 = '[{"operation":"buy", "unit-cost":10.00, "quantity": 100},{"operation":"sell", "unit-cost":15.00, "quantity": 50},{"operation":"sell", "unit-cost":15.00, "quantity": 50}]';
    const input2 = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":20.00, "quantity": 5000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000}]';
    
    // @ts-ignore - accessing private method for integration testing
    const result1 = controller.processSimulation(input1);
    // @ts-ignore - accessing private method for integration testing
    const result2 = controller.processSimulation(input2);
    
    expect(result1).toEqual([
      { tax: 0.0 },
      { tax: 0.0 },
      { tax: 0.0 }
    ]);
    
    expect(result2).toEqual([
      { tax: 0.0 },
      { tax: 10000.0 },
      { tax: 0.0 }
    ]);
  });
}); 