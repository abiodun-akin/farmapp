import { useState, useCallback } from 'react';

/**
 * Custom hook for form handling with validation
 * Reduces boilerplate for form state management and error handling
 */
export const useForm = (initialValues = {}, onSubmit = null) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const setFieldValue = useCallback((name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleArrayChange = useCallback((fieldName, value) => {
    setFormData((prev) => {
      // Handle nested field paths like "farmerDetails.farmingAreas"
      if (fieldName.includes('.')) {
        const [parentKey, childKey] = fieldName.split('.');
        return {
          ...prev,
          [parentKey]: {
            ...prev[parentKey],
            [childKey]: value,
          },
        };
      }
      // Simple field path
      return {
        ...prev,
        [fieldName]: value,
      };
    });
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched((prev) => ({
      ...prev,
      [name]: isTouched,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        if (onSubmit) {
          await onSubmit(formData);
        }
      } catch (error) {
        // Handle API errors
        if (error.response?.data?.field) {
          setFieldError(error.response.data.field, error.response.data.error);
        } else if (error.message) {
          setErrors({ general: error.message });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSubmit, setFieldError]
  );

  const resetForm = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback(
    (name) => ({
      name,
      value: formData[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] && errors[name] ? errors[name] : '',
      isTouched: touched[name] || false,
    }),
    [formData, errors, touched, handleChange, handleBlur]
  );

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleArrayChange,
    resetForm,
    getFieldProps,
  };
};

export default useForm;
