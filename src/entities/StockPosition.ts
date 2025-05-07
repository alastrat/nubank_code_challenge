import { StockOperation } from './StockOperation';

export class StockPosition {
  private static readonly MAX_ERRORS = 3;

  // Per-symbol tracking
  private quantities: Record<string, number>;
  private weightedAveragePrices: Record<string, number>;

  // Global tracking (for now)
  public accumulatedLoss: number;
  public errorCount: number;

  constructor() {
    this.quantities = {};
    this.weightedAveragePrices = {};
    this.accumulatedLoss = 0.0;
    this.errorCount = 0;
  }

  public incrementErrorCount(): void {
    this.errorCount++;
  }

  public isBlocked(): boolean {
    return this.errorCount >= StockPosition.MAX_ERRORS;
  }

  /*
  This method updates the position for a given stock operation.
  It checks if the operation is a buy or sell and updates the position accordingly.
  */
  public updatePosition(operation: StockOperation): void {
    const symbol = operation.symbol;
    if (!symbol) {
      // Or handle as a specific error, for now, we assume valid operations have titles
      throw new Error("Operation title (symbol) is missing.");
    }

    const currentQuantity = this.quantities[symbol] || 0;

    if (operation.operation === 'sell' && operation.quantity > currentQuantity) {
      throw new Error(`Insufficient shares of ${symbol} to complete the sell operation. Have: ${currentQuantity}, Need: ${operation.quantity}`);
    }

    if (operation.operation === 'buy') {
      this.updateBuyPosition(operation, symbol);
    } else {
      this.updateSellPosition(operation, symbol);
    }
  }

  /*
  This method updates the position for a buy operation.
  It calculates the total quantity and total cost of the position.
  It then updates the weighted average price and quantity.
  */
  private updateBuyPosition(operation: StockOperation, symbol: string): void {
    const currentQuantity = this.quantities[symbol] || 0;
    const currentWAP = this.weightedAveragePrices[symbol] || 0.0;

    const totalQuantity = currentQuantity + operation.quantity;
    const totalCost = (currentQuantity * currentWAP) +
      (operation.quantity * operation.unitCost);

    this.weightedAveragePrices[symbol] = totalQuantity > 0 ? totalCost / totalQuantity : operation.unitCost;
    this.quantities[symbol] = totalQuantity;
  }

  /*
  This method updates the position for a sell operation.
  It decreases the quantity of the position and updates the weighted average price.
  If the quantity becomes zero, it resets the weighted average price to zero.
  */
  private updateSellPosition(operation: StockOperation, symbol: string): void {
    // The check for sufficient quantity is already done in updatePosition
    this.quantities[symbol]! -= operation.quantity;

    if (this.quantities[symbol]! === 0) {
      // Optionally, remove the symbol from WAP or set to 0. Setting to 0 is fine.
      this.weightedAveragePrices[symbol] = 0;
      // We could also delete this.quantities[symbol] and this.weightedAveragePrices[symbol]
      // if quantity is zero to keep the objects cleaner, but it's not strictly necessary.
    }
  }

  /*
  This method calculates the profit for a given stock operation.
  It returns the profit as the difference between the unit cost and the weighted average price,
  multiplied by the quantity.
  */
  public calculateProfit(operation: StockOperation): number {
    const symbol = operation.symbol;
    if (!symbol) {
      throw new Error("Operation title (symbol) is missing for profit calculation.");
    }
    const currentWAP = this.weightedAveragePrices[symbol] || 0; // Default to 0 if symbol not yet bought
    // If currentWAP is 0 (e.g., selling without buying, which should be caught by quantity check, but as a safeguard)
    // profit calculation might be misleading. However, sell validation should prevent this.
    return (operation.unitCost - currentWAP) * operation.quantity;
  }

  /*
  This method resets the position to its initial state.
  It sets the quantity to zero, the weighted average price to zero, and the accumulated loss to zero.
  */
  public reset(): void {
    this.quantities = {};
    this.weightedAveragePrices = {};
    this.accumulatedLoss = 0.0;
    this.errorCount = 0;
  }

  // Helper method to get current quantity for a symbol (optional, could be useful for testing or other services)
  public getQuantityForSymbol(symbol: string): number {
    return this.quantities[symbol] || 0;
  }

  // Helper method to get WAP for a symbol (optional)
  public getWAPForSymbol(symbol: string): number {
    return this.weightedAveragePrices[symbol] || 0;
  }
} 