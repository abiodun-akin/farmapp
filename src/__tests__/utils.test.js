/**
 * Utility Functions Tests
 */

import { describe, it, expect } from 'vitest';

describe('Utility Functions', () => {
  describe('String manipulation', () => {
    it('should capitalize string', () => {
      const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should trim whitespace', () => {
      const input = '  hello  ';
      expect(input.trim()).toBe('hello');
    });

    it('should convert to lowercase', () => {
      expect('HELLO'.toLowerCase()).toBe('hello');
    });
  });

  describe('Number operations', () => {
    it('should add numbers correctly', () => {
      expect(5 + 3).toBe(8);
    });

    it('should handle floating point', () => {
      expect(0.1 + 0.2).toBeCloseTo(0.3);
    });

    it('should validate positive numbers', () => {
      const isPositive = (n) => n > 0;
      expect(isPositive(5)).toBe(true);
      expect(isPositive(-5)).toBe(false);
    });
  });

  describe('Array operations', () => {
    it('should find element in array', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(arr.includes(3)).toBe(true);
      expect(arr.includes(10)).toBe(false);
    });

    it('should filter array', () => {
      const arr = [1, 2, 3, 4, 5];
      const filtered = arr.filter((n) => n > 2);
      expect(filtered).toEqual([3, 4, 5]);
    });

    it('should map array', () => {
      const arr = [1, 2, 3];
      const doubled = arr.map((n) => n * 2);
      expect(doubled).toEqual([2, 4, 6]);
    });

    it('should find length of array', () => {
      expect([1, 2, 3].length).toBe(3);
      expect([].length).toBe(0);
    });
  });

  describe('Object operations', () => {
    it('should access object properties', () => {
      const obj = { name: 'John', age: 30 };
      expect(obj.name).toBe('John');
      expect(obj.age).toBe(30);
    });

    it('should merge objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const merged = { ...obj1, ...obj2 };
      expect(merged).toEqual({ a: 1, b: 2 });
    });

    it('should check if key exists', () => {
      const obj = { name: 'John' };
      expect('name' in obj).toBe(true);
      expect('age' in obj).toBe(false);
    });
  });

  describe('Validation helpers', () => {
    it('should validate email format', () => {
      const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
    });

    it('should validate password strength', () => {
      const validatePassword = (pwd) => pwd.length >= 8;
      expect(validatePassword('ShortPwd1')).toBe(true);
      expect(validatePassword('Short1')).toBe(false);
    });

    it('should validate phone number', () => {
      const validatePhone = (phone) => /^\d{10,}$/.test(phone);
      expect(validatePhone('1234567890')).toBe(true);
      expect(validatePhone('123')).toBe(false);
    });
  });
});
