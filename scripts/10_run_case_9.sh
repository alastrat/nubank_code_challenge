echo '[{"operation":"buy", "unit-cost": 5000.00, "quantity": 10},
{"operation":"sell", "unit-cost": 4000.00, "quantity": 5},
{"operation":"buy", "unit-cost": 15000.00, "quantity": 5},
{"operation":"buy", "unit-cost": 4000.00, "quantity": 2},
{"operation":"buy", "unit-cost": 23000.00, "quantity": 2},
{"operation":"sell", "unit-cost": 20000.00, "quantity": 1},
{"operation":"sell", "unit-cost": 12000.00, "quantity": 10},
{"operation":"sell", "unit-cost": 15000.00, "quantity": 3}]' | bun run src/index.ts