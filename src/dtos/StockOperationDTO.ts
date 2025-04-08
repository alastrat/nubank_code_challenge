import type { OperationType } from '../entities/StockOperation';

export interface StockOperationDTO {
  operation: OperationType;
  'unit-cost': number;
  quantity: number;
}

export interface TaxResultDTO {
  tax: number;
} 