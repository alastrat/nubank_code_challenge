#!/bin/bash
echo '[{"operation":"buy", "unit-cost":10.00, "quantity": 100}, {"operation":"sell", "unit-cost":15.00, "quantity": 150}]' | bun run src/index.ts 