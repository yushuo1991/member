import { useState, useCallback } from 'react';

export interface FieldError {
  message: string;
}

export interface FormErrors {
  [key: string]: FieldError | undefined;
}

export interface UseFormValidationOptions<T> {
  initialValues: T;
  validate: (values: T) => FormErrors;
  onSubmit: (values: T) => void | Promise<void>;
}

export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormValidationOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));

    // 清除该字段的错误（实时验证）
    if (touched[name as string]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }, [touched]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    // 验证单个字段
    const fieldErrors = validate(values);
    if (fieldErrors[name as string]) {
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name as string],
      }));
    }
  }, [values, validate]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // 标记所有字段为已触摸
    const allTouched = Object.keys(values).reduce((acc, key) => ({
      ...acc,
      [key]: true,
    }), {});
    setTouched(allTouched);

    // 验证所有字段
    const validationErrors = validate(values);
    setErrors(validationErrors);

    // 如果有错误，不提交
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // 提交表单
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    handleChange(name, value);
  }, [handleChange]);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: { message: error },
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
  };
}

/**
 * 常用验证规则
 */
export const validators = {
  required: (message = '此字段为必填项') => (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return undefined;
  },

  email: (message = '邮箱格式无效') => (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return message;
    }
    return undefined;
  },

  minLength: (min: number, message?: string) => (value: string) => {
    if (value && value.length < min) {
      return message || `至少需要${min}个字符`;
    }
    return undefined;
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    if (value && value.length > max) {
      return message || `最多${max}个字符`;
    }
    return undefined;
  },

  pattern: (regex: RegExp, message: string) => (value: string) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return undefined;
  },

  number: (message = '必须为数字') => (value: any) => {
    if (value && isNaN(Number(value))) {
      return message;
    }
    return undefined;
  },

  min: (min: number, message?: string) => (value: number) => {
    if (value && value < min) {
      return message || `最小值为${min}`;
    }
    return undefined;
  },

  max: (max: number, message?: string) => (value: number) => {
    if (value && value > max) {
      return message || `最大值为${max}`;
    }
    return undefined;
  },

  match: (otherField: string, message = '两次输入不匹配') => (value: any, values: any) => {
    if (value && value !== values[otherField]) {
      return message;
    }
    return undefined;
  },
};

/**
 * 组合多个验证规则
 */
export function composeValidators(...validators: Array<(value: any, values?: any) => string | undefined>) {
  return (value: any, values?: any): string | undefined => {
    for (const validator of validators) {
      const error = validator(value, values);
      if (error) return error;
    }
    return undefined;
  };
}
