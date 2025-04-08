import { StockOperation } from '../entities/StockOperation';
import type { IStockOperationRepository } from './IStockOperationRepository';

export class InMemoryStockOperationRepository implements IStockOperationRepository {
  private operations: StockOperation[] = [];

  public save(operation: StockOperation): void {
    this.operations.push(operation);
  }

  public getAll(): StockOperation[] {
    return [...this.operations];
  }

  public clear(): void {
    this.operations = [];
  }
} 