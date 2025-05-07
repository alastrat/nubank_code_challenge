import { StockOperation } from './StockOperation';

export class StockPosition {
  constructor(
    public quantity: number = 0,
    public weightedAveragePrice: number = 0.0,
    public accumulatedLoss: number = 0.0
  ) { }

  /*
  This method updates the position for a given stock operation.
  It checks if the operation is a buy or sell and updates the position accordingly.
  */
  public updatePosition(operation: StockOperation): void {
    if (operation.operation === 'sell' && operation.quantity > this.quantity) {
      throw new Error("Insufficient shares to complete the sell operation.");
    }

    if (operation.operation === 'buy') {
      this.updateBuyPosition(operation);
    } else {
      this.updateSellPosition(operation);
    }
  }

  /*
  This method updates the position for a buy operation.
  It calculates the total quantity and total cost of the position.
  It then updates the weighted average price and quantity.
  */
  private updateBuyPosition(operation: StockOperation): void {
    const totalQuantity = this.quantity + operation.quantity;
    const totalCost = (this.quantity * this.weightedAveragePrice) +
      (operation.quantity * operation.unitCost);

    this.weightedAveragePrice = totalQuantity > 0 ? totalCost / totalQuantity : operation.unitCost;
    this.quantity = totalQuantity;
  }

  /*
  This method updates the position for a sell operation.
  It decreases the quantity of the position and updates the weighted average price.
  If the quantity becomes zero, it resets the weighted average price to zero.
  */
  private updateSellPosition(operation: StockOperation): void {
    this.quantity -= operation.quantity;

    if (this.quantity === 0) {
      this.weightedAveragePrice = 0;
    }
  }

  /*
  This method calculates the profit for a given stock operation.
  It returns the profit as the difference between the unit cost and the weighted average price,
  multiplied by the quantity.
  */
  public calculateProfit(operation: StockOperation): number {
    return (operation.unitCost - this.weightedAveragePrice) * operation.quantity;
  }

  /*
  This method resets the position to its initial state.
  It sets the quantity to zero, the weighted average price to zero, and the accumulated loss to zero.
  */
  public reset(): void {
    this.quantity = 0;
    this.weightedAveragePrice = 0.0;
    this.accumulatedLoss = 0.0;
  }
} 