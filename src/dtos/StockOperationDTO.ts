import type { OperationType } from '../entities/StockOperation';

export interface StockOperationDTO {
  operation: OperationType;
  'unit-cost': number;
  quantity: number;
  symbol?: string;
}

export interface TaxResultDTO {
  tax?: number;
  error?: string;
} 