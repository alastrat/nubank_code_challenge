import { StockOperation } from '../entities/StockOperation';
import type { StockOperationDTO, TaxResultDTO } from '../dtos/StockOperationDTO';
import { CapitalGainsService } from '../services/CapitalGainsService';
import { InMemoryStockOperationRepository } from '../repositories/InMemoryStockOperationRepository';

/* 
This class is responsible for processing the input from the user and returning the results of the simulation.
It reads the input, extracts all JSON arrays from it, processes each array independently and collects all results.
Then it prints each result array on a new line.
*/
export class CapitalGainsController {
  /* 
  This method processes the input from the user and returns the results of the simulation.
  It reads the input, extracts all JSON arrays from it, processes each array independently and collects all results.
  Then it prints each result array on a new line.
  */
  public async processInput(): Promise<void> {
    try {
      const input = await this.readInput();

      // Extract all JSON arrays from input using regex
      const inputArrays = this.extractJsonArrays(input);

      // Process each array independently and collect all results
      const allResults = inputArrays.map(array => {
        try {
          const result = this.processSimulation(array);
          return result;
        } catch (error) {
          throw new Error(`Error processing simulation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      // This prints each result array on a new line
      allResults.forEach(result => {
        process.stdout.write(JSON.stringify(result));
        process.stdout.write('\n');
      });
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  }

  /*
  This method extracts all JSON arrays from the input string.
  It uses a regex to find all arrays in the input and validates each match is a valid JSON array.
  */
  private extractJsonArrays(input: string): string[] {
    const arrayPattern = /\[.*?\]/gs;
    const matches = input.match(arrayPattern) || [];

    if (matches.length === 0) {
      throw new Error('No valid JSON arrays found in input');
    }

    matches.forEach((match, index) => {
      try {
        JSON.parse(match);
      } catch (error) {
        throw new Error(`Invalid JSON array at position ${index + 1}`);
      }
    });

    return matches;
  }

  /*
  This method processes a single simulation input.
  It parses the input into StockOperation objects, saves them in an in-memory repository,
  and calculates the capital gains using the CapitalGainsService.
  */
  private processSimulation(input: string): TaxResultDTO[] {
    const operations = this.parseInput(input);
    const repository = new InMemoryStockOperationRepository();
    const capitalGainsService = new CapitalGainsService(repository);

    operations.forEach(operation => repository.save(operation));
    const result = capitalGainsService.execute();
    return result;
  }

  /*
  This method parses the input string into StockOperation objects.
  It uses JSON.parse to parse the input and validates the format of the input.
  */
  private parseInput(input: string): StockOperation[] {
    try {
      let dtos: StockOperationDTO[];
      try {
        dtos = JSON.parse(input) as StockOperationDTO[];
      } catch (parseError) {
        throw new Error('Invalid JSON format in array');
      }
      if (!Array.isArray(dtos)) {
        throw new Error('Input must be a JSON array');
      }

      return dtos.map(dto => {
        if (!dto.operation || !dto['unit-cost'] || !dto.quantity) {
          throw new Error('Invalid operation format');
        }
        return new StockOperation(dto.operation, dto['unit-cost'], dto.quantity);
      });
    } catch (error) {
      throw new Error('Invalid input format. Expected a valid JSON array of operations.');
    }
  }

  /*
  This method reads the input from the user.
  It returns a promise that resolves to the input string.
  */
  private async readInput(): Promise<string> {
    return new Promise((resolve) => {
      let input = '';
      process.stdin.on('data', (data) => {
        input += data.toString();
      });
      process.stdin.on('end', () => {
        resolve(input.trim());
      });
    });
  }
} 