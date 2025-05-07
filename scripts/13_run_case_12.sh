#!/bin/sh
echo '[
  {"symbol":"SYM1", "operation":"sell", "unit-cost":1000.00, "quantity": 100},
  {"symbol":"SYM2", "operation":"buy", "unit-cost":500.00, "quantity": 200},
  {"symbol":"SYM1", "operation":"sell", "unit-cost":1100.00, "quantity": 50},
  {"symbol":"SYM2", "operation":"buy", "unit-cost":550.00, "quantity": 150},
  {"symbol":"SYM1", "operation":"buy", "unit-cost":950.00, "quantity": 80},
  {"symbol":"SYM2", "operation":"sell", "unit-cost":600.00, "quantity": 250},
  {"symbol":"SYM1", "operation":"sell", "unit-cost":1150.00, "quantity": 100},
  {"symbol":"SYM2", "operation":"sell", "unit-cost":450.00, "quantity": 50}
]' | bun run src/index.ts 