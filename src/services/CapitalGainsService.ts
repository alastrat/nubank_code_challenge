import { StockOperation } from '../entities/StockOperation';
import { StockPosition } from '../entities/StockPosition';
import type { IStockOperationRepository } from '../repositories/IStockOperationRepository';
import type { TaxResultDTO } from '../dtos/StockOperationDTO';

export class CapitalGainsService {
  private static readonly TAX_RATE = 0.20;
  private static readonly TAX_THRESHOLD = 20000.0;

  constructor(
    private readonly repository: IStockOperationRepository
  ) { }

  /*
  This method rounds a number to one decimal place.
  */
  private roundToOneDecimal(value: number): number {
    return Number((Math.round(value * 10) / 10).toFixed(1));
  }

  /*
  This method executes the service.
  It gets all the operations from the repository, creates a new stock position,
  and processes each operation to calculate the tax result.
  */
  public execute(): TaxResultDTO[] {
    const operations = this.repository.getAll();
    const position = new StockPosition();
    const results: TaxResultDTO[] = [];

    for (const operation of operations) {
      const result = this.processOperation(operation, position);
      results.push(result);
    }

    return results;
  }

  /*
  This method processes an operation to calculate the tax result.
  It updates the position, calculates the profit, and then calculates the tax.
  */
  private processOperation(operation: StockOperation, position: StockPosition): TaxResultDTO {
    try {
      if (operation.operation === 'buy') {
        position.updatePosition(operation);
        return { tax: 0.0 };
      }

      // ---- SELL operation ----
      // 1. Calculate profit BEFORE position is mutated by the sell.
      //    calculateProfit uses operation.quantity. If this quantity is invalid (too high),
      //    the subsequent position.updatePosition will throw an error.
      const profit = position.calculateProfit(operation);

      // 2. Attempt to update position. This will THROW if operation.quantity > current position.quantity
      //    due to the check added in StockPosition.updatePosition.
      position.updatePosition(operation);

      // 3. If execution reaches here, the sell operation was valid and the position is updated.
      const totalAmount = this.roundToOneDecimal(operation.getTotalAmount());

      // If total amount is below threshold, no tax, but still track losses.
      if (totalAmount <= CapitalGainsService.TAX_THRESHOLD) {
        if (profit < 0) {
          position.accumulatedLoss = this.roundToOneDecimal(position.accumulatedLoss + Math.abs(profit));
        }
        return { tax: 0.0 };
      }

      // If it's a loss (or zero profit) and above the threshold, accumulate it and return no tax.
      if (profit <= 0) {
        position.accumulatedLoss = this.roundToOneDecimal(position.accumulatedLoss + Math.abs(profit));
        return { tax: 0.0 };
      }

      // For profits above the threshold, first deduct any accumulated losses.
      const taxableProfit = this.calculateTaxableProfit(profit, position);
      const tax = taxableProfit > 0 ? this.roundToOneDecimal(taxableProfit * CapitalGainsService.TAX_RATE) : 0.0;

      return { tax };

    } catch (e: any) {
      // Ensure e.message is a string before assigning it to the error property.
      if (typeof e.message === 'string') {
        return { error: e.message };
      }
      // Fallback error message if e.message is not a string.
      return { error: "An unexpected error occurred during operation processing." };
    }
  }

  /*
  This method calculates the taxable profit for a given stock operation.
  It deducts any accumulated losses from the profit and returns the remaining profit.
  */
  private calculateTaxableProfit(profit: number, position: StockPosition): number {
    if (position.accumulatedLoss >= profit) {
      position.accumulatedLoss = this.roundToOneDecimal(position.accumulatedLoss - profit);
      return 0.0;
    }

    const remainingProfit = this.roundToOneDecimal(profit - position.accumulatedLoss);
    position.accumulatedLoss = 0.0;
    return remainingProfit;
  }
} 