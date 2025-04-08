export type OperationType = 'buy' | 'sell';

/**
 * Represents a stock operation.
 * 
 * @property operation - The type of operation (buy or sell).
 * @property unitCost - The unit cost of the stock.
 * @property quantity - The quantity of the stock.
 */
export class StockOperation {
  constructor(
    public readonly operation: OperationType,
    public readonly unitCost: number,
    public readonly quantity: number
  ) {
    this.validate();
  }

  /**
   * Validates the stock operation.
   * 
   * @throws Error if the unit cost or quantity is not greater than zero.
   */
  private validate(): void {
    if (this.unitCost <= 0) {
      throw new Error('Unit cost must be greater than zero');
    }
    if (this.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
  }

  /**
   * Calculates the total amount of the stock operation.
   * 
   * @returns The total amount of the stock operation.
   */
  public getTotalAmount(): number {
    return this.unitCost * this.quantity;
  }
} 