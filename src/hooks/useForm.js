import { useState, useCallback } from 'react';

/**
 * Custom hook for form handling with validation
 * Reduces boilerplate for form state management and error handling
 */
export const useForm = (initialValues = {}, onSubmit = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
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
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
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
          await onSubmit(values);
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
    [values, onSubmit, setFieldError]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback(
    (name) => ({
      name,
      value: values[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] && errors[name] ? errors[name] : '',
      isTouched: touched[name] || false,
    }),
    [values, errors, touched, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    getFieldProps,
  };
};

export default useForm;
