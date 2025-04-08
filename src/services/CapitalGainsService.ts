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
    if (operation.operation === 'buy') {
      position.updatePosition(operation);
      return { tax: 0.0 };
    }

    // For sell operations
    const totalAmount = this.roundToOneDecimal(operation.getTotalAmount());
    const profit = position.calculateProfit(operation);

    // Update position after calculating profit but before calculating tax
    position.updatePosition(operation);

    // If total amount is below threshold, no tax but still track losses
    if (totalAmount <= CapitalGainsService.TAX_THRESHOLD) {
      if (profit < 0) {
        position.accumulatedLoss = this.roundToOneDecimal(position.accumulatedLoss + Math.abs(profit));
      }
      return { tax: 0.0 };
    }

    // If it's a loss, accumulate it and return no tax
    if (profit <= 0) {
      position.accumulatedLoss = this.roundToOneDecimal(position.accumulatedLoss + Math.abs(profit));
      return { tax: 0.0 };
    }

    // For profits, first deduct any accumulated losses
    const taxableProfit = this.calculateTaxableProfit(profit, position);
    const tax = taxableProfit > 0 ? this.roundToOneDecimal(taxableProfit * CapitalGainsService.TAX_RATE) : 0.0;

    return { tax };
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