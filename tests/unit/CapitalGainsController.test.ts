import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CapitalGainsController } from '../../src/controllers/CapitalGainsController';

describe('CapitalGainsController', () => {
  let controller: CapitalGainsController;
  // Save original process.stdin and process.stdout
  const originalStdIn = process.stdin;
  const originalStdOut = process.stdout;
  const mockStdOut = { write: vi.fn() };

  beforeEach(() => {
    controller = new CapitalGainsController();
    // Mocking stdout.write
    process.stdout.write = mockStdOut.write;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.stdin = originalStdIn;
    process.stdout = originalStdOut;
  });

  describe('extractJsonArrays', () => {
    it('should extract a single JSON array from input', () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 100}]';
      // @ts-ignore - accessing private method for testing
      const result = controller.extractJsonArrays(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(input);
    });

    it('should extract multiple JSON arrays from input', () => {
      const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 100}]
      [{"operation":"sell", "unit-cost":15.00, "quantity": 50}]`;
      // @ts-ignore - accessing private method for testing
      const result = controller.extractJsonArrays(input);
      expect(result).toHaveLength(2);
    });

    it('should throw error for invalid JSON arrays', () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 100]'; // Missing closing brace
      // @ts-ignore - accessing private method for testing
      expect(() => controller.extractJsonArrays(input)).toThrow(/Invalid JSON array/);
    });

    it('should throw error for empty input', () => {
      const input = '';
      // @ts-ignore - accessing private method for testing
      expect(() => controller.extractJsonArrays(input)).toThrow(/No valid JSON arrays found/);
    });

    // Additional test to cover the specific branch where invalid JSON is detected at a position
    it('should include position in error message for invalid array', () => {
      // Create a spy for JSON.parse that throws an error for the second call
      const originalJsonParse = JSON.parse;
      let callCount = 0;
      
      JSON.parse = vi.fn().mockImplementation((str) => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Invalid JSON');
        }
        return originalJsonParse(str);
      });
      
      // Create input with two arrays
      const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 100}]
      [{"operation":"sell", "unit-cost":15.00, "quantity": 50}]`;
      
      // Test that it throws with the position indicated
      // @ts-ignore - accessing private method for testing
      expect(() => controller.extractJsonArrays(input)).toThrow(/Invalid JSON array at position 2/);
      
      // Restore JSON.parse
      JSON.parse = originalJsonParse;
    });
  });

  describe('parseInput', () => {
    it('should parse a valid JSON array of operations', () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 100}]';
      // @ts-ignore - accessing private method for testing
      const result = controller.parseInput(input);
      expect(result).toHaveLength(1);
      
      const firstOperation = result[0];
      expect(firstOperation?.operation).toBe('buy');
      expect(firstOperation?.unitCost).toBe(10.00);
      expect(firstOperation?.quantity).toBe(100);
    });

    it('should throw error for invalid JSON format', () => {
      const input = 'not a json';
      // @ts-ignore - accessing private method for testing
      expect(() => controller.parseInput(input)).toThrow(/Invalid input format/);
    });

    it('should throw error for JSON that is not an array', () => {
      const input = '{"operation":"buy", "unit-cost":10.00, "quantity": 100}';
      // @ts-ignore - accessing private method for testing
      expect(() => controller.parseInput(input)).toThrow(/Invalid input format/);
    });

    it('should throw error for operations missing required fields', () => {
      const input = '[{"operation":"buy", "quantity": 100}]'; // Missing unit-cost
      // @ts-ignore - accessing private method for testing
      expect(() => controller.parseInput(input)).toThrow(/Invalid input format/);
    });
  });

  describe('processSimulation', () => {
    it('should process a simulation with multiple operations', () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 100},{"operation":"sell", "unit-cost":15.00, "quantity": 50}]';
      // @ts-ignore - accessing private method for testing
      const result = controller.processSimulation(input);
      expect(result).toHaveLength(2);
      expect(result[0]?.tax).toBe(0.0);
      expect(result[1]?.tax).toBe(0.0);
    });

    it('should process a simulation with tax calculations', () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":20.00, "quantity": 5000}]';
      // @ts-ignore - accessing private method for testing
      const result = controller.processSimulation(input);
      expect(result).toHaveLength(2);
      expect(result[0]?.tax).toBe(0.0);
      expect(result[1]?.tax).toBe(10000.0);
    });
  });

  describe('processInput', () => {
    it('should handle input and output correctly', async () => {
      // Setup
      const mockInput = '[{"operation":"buy", "unit-cost":10.00, "quantity": 100}]';
      const mockStdin = {
        on: vi.fn((event, callback) => {
          if (event === 'data') {
            callback(mockInput);
          }
          if (event === 'end') {
            callback();
          }
          return mockStdin;
        })
      };
      process.stdin = mockStdin as any;

      // Execute
      await controller.processInput();

      // Verify
      expect(mockStdOut.write).toHaveBeenCalledWith('[{"tax":0}]');
      expect(mockStdOut.write).toHaveBeenCalledWith('\n');
    });

    it('should handle multiple simulations', async () => {
      // Setup
      const mockInput = `[{"operation":"buy", "unit-cost":10.00, "quantity": 100}]
      [{"operation":"buy", "unit-cost":20.00, "quantity": 200}]`;
      const mockStdin = {
        on: vi.fn((event, callback) => {
          if (event === 'data') {
            callback(mockInput);
          }
          if (event === 'end') {
            callback();
          }
          return mockStdin;
        })
      };
      process.stdin = mockStdin as any;

      // Execute
      await controller.processInput();

      // Verify
      expect(mockStdOut.write).toHaveBeenCalledWith('[{"tax":0}]');
      expect(mockStdOut.write).toHaveBeenCalledWith('\n');
      expect(mockStdOut.write).toHaveBeenCalledWith('[{"tax":0}]');
      expect(mockStdOut.write).toHaveBeenCalledWith('\n');
    });

    it('should handle errors in processing simulations', async () => {
      // Setup - Using invalid JSON format to trigger error
      const mockInput = 'this is not valid JSON';
      const mockStdin = {
        on: vi.fn((event, callback) => {
          if (event === 'data') {
            callback(mockInput);
          }
          if (event === 'end') {
            callback();
          }
          return mockStdin;
        })
      };
      process.stdin = mockStdin as any;
      
      // Mock console.error and process.exit to prevent test from exiting
      const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
      const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      // Execute
      await controller.processInput();

      // Verify
      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(1);
      
      // Cleanup mocks
      mockExit.mockRestore();
      mockConsoleError.mockRestore();
    });

    it('should handle errors occurring in processSimulation', async () => {
      // Setup
      const mockInput = '[{"operation":"buy", "unit-cost":10.00, "quantity": 100}]';
      const mockStdin = {
        on: vi.fn((event, callback) => {
          if (event === 'data') {
            callback(mockInput);
          }
          if (event === 'end') {
            callback();
          }
          return mockStdin;
        })
      };
      process.stdin = mockStdin as any;
      
      // Mock processSimulation to throw an error
      const mockProcessSimulation = vi.spyOn(controller as any, 'processSimulation')
        .mockImplementation(() => {
          throw new Error('Test error in processSimulation');
        });
      
      // Mock console.error and process.exit to prevent test from exiting
      const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
      const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      // Execute
      await controller.processInput();

      // Verify
      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(1);
      
      // Cleanup mocks
      mockProcessSimulation.mockRestore();
      mockExit.mockRestore();
      mockConsoleError.mockRestore();
    });
  });
}); 