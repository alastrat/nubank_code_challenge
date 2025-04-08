import { describe, it, expect } from 'vitest';
import { InMemoryStockOperationRepository } from '../../src/repositories/InMemoryStockOperationRepository';
import { StockOperation } from '../../src/entities/StockOperation';

describe('InMemoryStockOperationRepository', () => {
  it('should save an operation', () => {
    const repository = new InMemoryStockOperationRepository();
    const operation = new StockOperation('buy', 10.0, 100);

    repository.save(operation);

    const operations = repository.getAll();
    expect(operations).toHaveLength(1);
    expect(operations[0]).toBe(operation);
  });

  it('should save multiple operations', () => {
    const repository = new InMemoryStockOperationRepository();
    const operation1 = new StockOperation('buy', 10.0, 100);
    const operation2 = new StockOperation('sell', 15.0, 50);

    repository.save(operation1);
    repository.save(operation2);

    const operations = repository.getAll();
    expect(operations).toHaveLength(2);
    expect(operations[0]).toBe(operation1);
    expect(operations[1]).toBe(operation2);
  });
}); 