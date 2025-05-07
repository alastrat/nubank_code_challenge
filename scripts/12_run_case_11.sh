#!/bin/sh
echo '[
  {"operation":"buy", "unit-cost":10.00, "quantity": 50},
  {"operation":"sell", "unit-cost":15.00, "quantity": 100},
  {"operation":"buy", "unit-cost":10.00, "quantity": 20},
  {"operation":"sell", "unit-cost":15.00, "quantity": 100},
  {"operation":"buy", "unit-cost":10.00, "quantity": 10},
  {"operation":"sell", "unit-cost":15.00, "quantity": 100},
  {"operation":"buy", "unit-cost":20.00, "quantity": 100},
  {"operation":"sell", "unit-cost":25.00, "quantity": 10}
]' | bun run src/index.ts 