/**
 * API and Data Handling Tests
 */

import { describe, it, expect } from 'vitest';

describe('API Utilities', () => {
  describe('Request handling', () => {
    it('should build API URL', () => {
      const buildUrl = (base, endpoint) => `${base}${endpoint}`;
      expect(buildUrl('https://api.example.com', '/users')).toBe(
        'https://api.example.com/users'
      );
    });

    it('should add query parameters', () => {
      const addQuery = (url, params) => {
        const query = new URLSearchParams(params).toString();
        return `${url}?${query}`;
      };

      const result = addQuery('https://api.example.com/users', { limit: 10, page: 1 });
      expect(result).toContain('limit=10');
      expect(result).toContain('page=1');
    });

    it('should build request headers', () => {
      const buildHeaders = (token) => ({
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
      });

      const headers = buildHeaders('abc123');
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers.Authorization).toBe('Bearer abc123');
    });
  });

  describe('Response handling', () => {
    it('should check response status', () => {
      const isSuccess = (status) => status >= 200 && status < 300;
      expect(isSuccess(200)).toBe(true);
      expect(isSuccess(404)).toBe(false);
      expect(isSuccess(500)).toBe(false);
    });

    it('should extract response data', () => {
      const extractData = (response) => response.data || response;
      expect(extractData({ data: { id: 1 } })).toEqual({ id: 1 });
      expect(extractData({ id: 1 })).toEqual({ id: 1 });
    });

    it('should handle error response', () => {
      const getErrorMessage = (error) =>
        error?.response?.data?.message || error?.message || 'Unknown error';

      expect(getErrorMessage({ response: { data: { message: 'Not found' } } })).toBe(
        'Not found'
      );
      expect(getErrorMessage({ message: 'Network error' })).toBe('Network error');
    });
  });

  describe('Data transformation', () => {
    it('should format user data', () => {
      const formatUser = (user) => ({
        id: user.id,
        name: user.name?.toUpperCase(),
        email: user.email?.toLowerCase(),
      });

      const user = { id: 1, name: 'john', email: 'JOHN@EXAMPLE.COM' };
      const formatted = formatUser(user);

      expect(formatted.name).toBe('JOHN');
      expect(formatted.email).toBe('john@example.com');
    });

    it('should paginate data', () => {
      const paginate = (items, page, limit) => {
        const start = (page - 1) * limit;
        return items.slice(start, start + limit);
      };

      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(paginate(items, 1, 3)).toEqual([1, 2, 3]);
      expect(paginate(items, 2, 3)).toEqual([4, 5, 6]);
    });

    it('should sort data', () => {
      const sortByField = (items, field, order = 'asc') => {
        return [...items].sort((a, b) => {
          const comparison = a[field] > b[field] ? 1 : -1;
          return order === 'asc' ? comparison : -comparison;
        });
      };

      const items = [
        { name: 'Bob', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Charlie', age: 35 },
      ];
      const sorted = sortByField(items, 'name');

      expect(sorted[0].name).toBe('Alice');
      expect(sorted[2].name).toBe('Charlie');
    });
  });

  describe('Data validation', () => {
    it('should validate required fields', () => {
      const validateRequired = (obj, fields) => {
        return fields.every((field) => obj[field] !== undefined && obj[field] !== '');
      };

      const user = { name: 'John', email: 'john@example.com' };
      expect(validateRequired(user, ['name', 'email'])).toBe(true);
      expect(validateRequired(user, ['name', 'phone'])).toBe(false);
    });

    it('should validate data types', () => {
      const isValidType = (value, type) => typeof value === type;

      expect(isValidType('string', 'string')).toBe(true);
      expect(isValidType(123, 'number')).toBe(true);
      expect(isValidType(true, 'boolean')).toBe(true);
      expect(isValidType('123', 'number')).toBe(false);
    });

    it('should validate array length', () => {
      const validateArrayLength = (arr, min, max) =>
        arr.length >= min && arr.length <= max;

      expect(validateArrayLength([1, 2, 3], 2, 5)).toBe(true);
      expect(validateArrayLength([1], 2, 5)).toBe(false);
      expect(validateArrayLength([1, 2, 3, 4, 5, 6], 2, 5)).toBe(false);
    });
  });

  describe('Caching and storage', () => {
    it('should store and retrieve data', () => {
      const storage = {};
      const store = (key, value) => {
        storage[key] = value;
      };
      const retrieve = (key) => storage[key];

      store('user', { id: 1, name: 'John' });
      expect(retrieve('user')).toEqual({ id: 1, name: 'John' });
    });

    it('should clear storage', () => {
      const storage = { user: { id: 1 } };
      const clear = (key) => {
        delete storage[key];
      };

      clear('user');
      expect(storage.user).toBeUndefined();
    });

    it('should check if key exists', () => {
      const storage = { user: { id: 1 } };
      const hasKey = (key) => key in storage;

      expect(hasKey('user')).toBe(true);
      expect(hasKey('admin')).toBe(false);
    });
  });
});
