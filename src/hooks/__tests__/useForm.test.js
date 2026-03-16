import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from '../useForm';

describe('useForm Hook', () => {
  describe('formData state and initialization', () => {
    it('should initialize formData with provided initial values', () => {
      const initialValues = {
        name: 'John',
        email: 'john@example.com',
        phone: '1234567890',
      };

      const { result } = renderHook(() => useForm(initialValues));

      expect(result.current.formData).toEqual(initialValues);
    });

    it('should return formData (not values) for destructuring compatibility', () => {
      const initialValues = { phone: '' };
      const { result } = renderHook(() => useForm(initialValues));

      expect(result.current).toHaveProperty('formData');
      expect(result.current.formData).toEqual(initialValues);
    });

    it('should initialize with empty object if no initial values provided', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current.formData).toEqual({});
    });
  });

  describe('handleChange function', () => {
    it('should update formData when input changes', () => {
      const { result } = renderHook(() =>
        useForm({
          phone: '',
          name: '',
        })
      );

      act(() => {
        result.current.handleChange({
          target: { name: 'phone', value: '1234567890', type: 'text' },
        });
      });

      expect(result.current.formData.phone).toBe('1234567890');
    });

    it('should handle checkbox inputs', () => {
      const { result } = renderHook(() =>
        useForm({
          acceptTerms: false,
        })
      );

      act(() => {
        result.current.handleChange({
          target: { name: 'acceptTerms', type: 'checkbox', checked: true },
        });
      });

      expect(result.current.formData.acceptTerms).toBe(true);
    });

    it('should clear error when field changes', () => {
      const { result } = renderHook(() => useForm({ phone: '' }));

      // Set an error first
      act(() => {
        result.current.setFieldError('phone', 'Phone is required');
      });

      expect(result.current.errors.phone).toBe('Phone is required');

      // Change the field
      act(() => {
        result.current.handleChange({
          target: { name: 'phone', value: '123', type: 'text' },
        });
      });

      expect(result.current.errors.phone).toBe('');
    });
  });

  describe('handleArrayChange function', () => {
    it('should exist and be callable', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current).toHaveProperty('handleArrayChange');
      expect(typeof result.current.handleArrayChange).toBe('function');
    });

    it('should update simple fields', () => {
      const { result } = renderHook(() =>
        useForm({
          farmSize: '',
        })
      );

      act(() => {
        result.current.handleArrayChange('farmSize', '100 hectares');
      });

      expect(result.current.formData.farmSize).toBe('100 hectares');
    });

    it('should update nested fields with dot notation', () => {
      const { result } = renderHook(() =>
        useForm({
          farmerDetails: {
            farmingAreas: ['Dry Season Farming'],
          },
        })
      );

      act(() => {
        result.current.handleArrayChange('farmerDetails.farmSize', '5-10 hectares');
      });

      expect(result.current.formData.farmerDetails.farmSize).toBe('5-10 hectares');
      // Original farmingAreas should be preserved
      expect(result.current.formData.farmerDetails.farmingAreas).toEqual([
        'Dry Season Farming',
      ]);
    });

    it('should handle nested field updates without losing other properties', () => {
      const { result } = renderHook(() =>
        useForm({
          phone: '1234567890',
          farmerDetails: {
            cropsProduced: ['Maize', 'Rice'],
            farmSize: '1-5 hectares',
          },
        })
      );

      act(() => {
        result.current.handleArrayChange('farmerDetails.cropsProduced', ['Maize', 'Rice', 'Cassava']);
      });

      expect(result.current.formData.phone).toBe('1234567890');
      expect(result.current.formData.farmerDetails.cropsProduced).toEqual([
        'Maize',
        'Rice',
        'Cassava',
      ]);
      expect(result.current.formData.farmerDetails.farmSize).toBe('1-5 hectares');
    });
  });

  describe('setFieldValue function', () => {
    it('should update formData for a specific field', () => {
      const { result } = renderHook(() =>
        useForm({
          name: 'John',
          email: 'john@example.com',
        })
      );

      act(() => {
        result.current.setFieldValue('email', 'newemail@example.com');
      });

      expect(result.current.formData.email).toBe('newemail@example.com');
      expect(result.current.formData.name).toBe('John');
    });
  });

  describe('resetForm function', () => {
    it('should reset formData to initial values', () => {
      const initialValues = {
        phone: '1234567890',
        name: 'John',
      };

      const { result } = renderHook(() => useForm(initialValues));

      // Change values
      act(() => {
        result.current.handleChange({
          target: { name: 'phone', value: '9999999999', type: 'text' },
        });
      });

      expect(result.current.formData.phone).toBe('9999999999');

      // Reset
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });
  });

  describe('error handling', () => {
    it('should set and clear field errors', () => {
      const { result } = renderHook(() => useForm({ phone: '' }));

      act(() => {
        result.current.setFieldError('phone', 'Phone is required');
      });

      expect(result.current.errors.phone).toBe('Phone is required');

      act(() => {
        result.current.setFieldError('phone', '');
      });

      expect(result.current.errors.phone).toBe('');
    });

    it('should track touched fields', () => {
      const { result } = renderHook(() => useForm({ phone: '' }));

      act(() => {
        result.current.handleBlur({
          target: { name: 'phone' },
        });
      });

      expect(result.current.touched.phone).toBe(true);
    });
  });

  describe('integration test - Farmer Profile Form scenario', () => {
    it('should handle complex nested form data like FarmerProfileForm', () => {
      const initialValues = {
        phone: '',
        location: '',
        state: '',
        lga: '',
        bio: '',
        farmerDetails: {
          farmingAreas: [],
          cropsProduced: [],
          animalsRaised: [],
          farmSize: '',
          yearsOfExperience: '',
          certifications: [],
          interests: [],
          additionalInfo: '',
        },
      };

      const { result } = renderHook(() => useForm(initialValues));

      // Simulate user filling out the form
      act(() => {
        result.current.handleChange({
          target: { name: 'phone', value: '+2348012345678', type: 'text' },
        });
      });

      act(() => {
        result.current.handleChange({
          target: { name: 'location', value: 'Lagos', type: 'text' },
        });
      });

      act(() => {
        result.current.handleChange({
          target: { name: 'state', value: 'Lagos', type: 'text' },
        });
      });

      act(() => {
        result.current.handleArrayChange('farmerDetails.farmSize', '5-10 hectares');
      });

      act(() => {
        result.current.handleArrayChange('farmerDetails.yearsOfExperience', '3-5 years');
      });

      // Verify all data is properly stored
      expect(result.current.formData.phone).toBe('+2348012345678');
      expect(result.current.formData.location).toBe('Lagos');
      expect(result.current.formData.state).toBe('Lagos');
      expect(result.current.formData.farmerDetails.farmSize).toBe('5-10 hectares');
      expect(result.current.formData.farmerDetails.yearsOfExperience).toBe('3-5 years');
      expect(result.current.formData.farmerDetails.farmingAreas).toEqual([]);
    });
  });
});
