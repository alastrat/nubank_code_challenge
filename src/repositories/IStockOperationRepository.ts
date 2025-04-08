import type { StockOperation } from '../entities/StockOperation';

export interface IStockOperationRepository {
  save(operation: StockOperation): void;
  getAll(): StockOperation[];
  clear(): void;
} 