import {useState, useCallback} from "react";

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

interface Errors {
  [key: string]: string;
}

export const useFormValidation = <T extends object>(
  initialState: T,
  validationRules: {[K in keyof T]?: ValidationRules}
) => {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(
    (name: keyof T, value: any) => {
      const rules = validationRules[name];
      if (!rules) return "";

      if (rules.required && !value) {
        return `${String(name)} is required`;
      }

      if (rules.minLength && value.length < rules.minLength) {
        return `${String(name)} must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `${String(name)} must be less than ${
          rules.maxLength
        } characters`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return `${String(name)} is invalid`;
      }

      if (rules.custom && !rules.custom(value)) {
        return `${String(name)} is invalid`;
      }

      return "";
    },
    [validationRules]
  );

  const handleChange = (name: keyof T, value: any) => {
    setValues((prev) => ({...prev, [name]: value}));
    const error = validate(name, value);
    setErrors((prev) => ({...prev, [name]: error}));
  };

  const handleSubmit = async (onSubmit: (values: T) => Promise<void>) => {
    setIsSubmitting(true);
    const newErrors: Errors = {};

    // Validate all fields
    Object.keys(values).forEach((key) => {
      const error = validate(key as keyof T, values[key as keyof T]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error("Form submission error:", error);
      }
    }

    setIsSubmitting(false);
  };

  return {values, errors, isSubmitting, handleChange, handleSubmit};
};
