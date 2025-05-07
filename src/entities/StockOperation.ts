export type OperationType = 'buy' | 'sell';

export class StockOperation {
  constructor(
    public readonly operation: OperationType,
    public readonly unitCost: number,
    public readonly quantity: number,
    public readonly symbol?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.unitCost <= 0) {
      throw new Error('Unit cost must be greater than zero');
    }
    if (this.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
  }

  public getTotalAmount(): number {
    return this.unitCost * this.quantity;
  }
} 