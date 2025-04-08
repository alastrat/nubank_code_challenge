import { describe, it, expect } from 'vitest';
import { StockOperation } from '../../src/entities/StockOperation';

describe('StockOperation', () => {
  it('should create a valid StockOperation', () => {
    const operation = new StockOperation('buy', 10.0, 100);
    expect(operation.operation).toBe('buy');
    expect(operation.unitCost).toBe(10.0);
    expect(operation.quantity).toBe(100);
  });

  it('should throw error when unit cost is negative', () => {
    expect(() => new StockOperation('buy', -10.0, 100)).toThrow('Unit cost must be greater than zero');
  });

  it('should throw error when unit cost is zero', () => {
    expect(() => new StockOperation('buy', 0, 100)).toThrow('Unit cost must be greater than zero');
  });

  it('should throw error when quantity is negative', () => {
    expect(() => new StockOperation('buy', 10.0, -100)).toThrow('Quantity must be greater than zero');
  });

  it('should throw error when quantity is zero', () => {
    expect(() => new StockOperation('buy', 10.0, 0)).toThrow('Quantity must be greater than zero');
  });

  it('should calculate total amount correctly', () => {
    const operation = new StockOperation('buy', 10.0, 100);
    expect(operation.getTotalAmount()).toBe(1000);
  });

  it('should handle different operation types', () => {
    const buyOperation = new StockOperation('buy', 10.0, 100);
    expect(buyOperation.operation).toBe('buy');

    const sellOperation = new StockOperation('sell', 15.0, 50);
    expect(sellOperation.operation).toBe('sell');
  });
}); 