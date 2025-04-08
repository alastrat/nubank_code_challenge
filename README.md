# Capital Gains Calculator

A command-line application that calculates capital gains tax for stock market operations.

## Features

- Calculates capital gains tax based on stock market operations
- Supports buy and sell operations
- Handles weighted average price calculations
- Manages accumulated losses
- Processes multiple operations in sequence
- Validates input format

## Requirements

- Bun runtime environment

## Installation

1. Clone the repository
2. Install dependencies:
```bash
bun install
```

## Architecture

The application follows clean architecture principles:

- Domain Layer: Core business logic and entities
- Application Layer: Use cases and business rules
- Interface Layer: CLI interface and input/output handling

## Tax Calculation Rules

1. Tax rate is 20% of the profit
2. No tax is charged for operations with total amount ≤ $20,000
3. Losses are deducted from future profits
4. Weighted average price is used for profit calculation
5. Buy operations do not generate tax

## Usage

The application reads input from stdin and writes output to stdout. Input should be a JSON array of operations, where each operation has the following format:

```json
{
  "operation": "buy" | "sell",
  "unit-cost": number,
  "quantity": number
}
```

Example:
```bash
echo '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000 }, {"operation":"sell", "unit-cost":20.00, "quantity": 5000 }]' | bun run src/index.ts
```

Output will be a JSON array of tax results:
```json
[{"tax": 0}, {"tax": 10000}]
```

### Test Scripts

The project includes several test scripts in the `scripts/` folder that demonstrate different scenarios:

```bash
# Basic Operations
sh scripts/1_run_case_1.sh    # Simple buy/sell sequence with no tax (amount ≤ $20,000)

# Tax Calculations
sh scripts/2_run_case_2.sh    # High-value operations with tax calculation (amount > $20,000)

# Multiple Simulations
sh scripts/3_run_case_1_and_case_2.sh  # Processing two independent simulations in sequence

# Edge Cases
sh scripts/4_run_case_3.sh    # Operations just below tax threshold ($20,000)
sh scripts/5_run_case_4.sh    # Loss handling and accumulation
sh scripts/6_run_case_5.sh    # Multiple profitable operations with tax
sh scripts/7_run_case_6.sh    # Using accumulated losses to offset future profits
sh scripts/8_run_case_7.sh    # Complex sequence with mixed profits and losses
sh scripts/9_run_case_8.sh    # Very high value operations (>$100,000)
sh scripts/10_run_case_9.sh   # Progressive profit/loss scenarios with tax implications
```

Example test cases and their expected outputs:

1. Basic buy/sell with no tax:
```json
Input: [{"operation":"buy", "unit-cost":10.0, "quantity": 100}, {"operation":"sell", "unit-cost":15.0, "quantity": 50}, {"operation":"sell", "unit-cost":15.0, "quantity": 50}]
Output: [{"tax":0.0}, {"tax":0.0}, {"tax":0.0}]
```

2. High-value operation with tax:
```json
Input: [{"operation":"buy", "unit-cost":10.0, "quantity": 10000}, {"operation":"sell", "unit-cost":20.0, "quantity": 5000}, {"operation":"sell", "unit-cost":5.0, "quantity": 5000}]
Output: [{"tax":0.0}, {"tax":10000.0}, {"tax":0.0}]
```

Each script demonstrates specific aspects of the tax calculation rules:
- Weighted average price calculations
- Tax threshold handling ($20,000)
- Loss accumulation and deduction
- Multiple independent simulations
- Edge cases around the tax threshold
- Complex scenarios with mixed profits and losses

## Testing
Run tests in watch mode:
```bash
bun test:watch
```

Generate test coverage report:
```bash
bun test:coverage
```

Run tests:
```bash
bun test
```

