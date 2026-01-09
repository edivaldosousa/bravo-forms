// VALIDATION & CONDITIONAL LOGIC SERVICE
// Features 6 & 7: Advanced Validation + Conditional Field Logic

import { FormElement, FormResponse } from '../types';

// VALIDATION RULES
export interface ValidationRule {
  type: string;
  value?: any;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// REGEX PATTERNS FOR VALIDATION
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\d{10,15}$/,
  url: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  zipcode: /^\d{5}(-\d{4})?$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  ipAddress: /^(\d{1,3}\.){3}\d{1,3}$/,
  creditCard: /^\d{13,19}$/
};

// FIELD VALIDATION
export const validateField = (value: any, field: FormElement): ValidationResult => {
  const errors: string[] = [];

  // Check required
  if (field.required && (!value || value.toString().trim() === '')) {
    errors.push(`${field.label || 'Campo'} é obrigatório`);
    return { isValid: false, errors };
  }

  if (!value || value.toString().trim() === '') {
    return { isValid: true, errors: [] };
  }

  // Type-specific validation
  switch (field.type) {
    case 'EMAIL':
    case 'TEXT':
      if (field.validations?.pattern && !new RegExp(field.validations.pattern).test(String(value))) {
        errors.push(`${field.label} tem formato inválido`);
      }
      if (field.validations?.minLength && String(value).length < field.validations.minLength) {
        errors.push(`${field.label} deve ter no mínimo ${field.validations.minLength} caracteres`);
      }
      if (field.validations?.maxLength && String(value).length > field.validations.maxLength) {
        errors.push(`${field.label} deve ter no máximo ${field.validations.maxLength} caracteres`);
      }
      break;

    case 'NUMBER':
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        errors.push(`${field.label} deve ser um número`);
      } else {
        if (field.validations?.min !== undefined && numValue < field.validations.min) {
          errors.push(`${field.label} deve ser no mínimo ${field.validations.min}`);
        }
        if (field.validations?.max !== undefined && numValue > field.validations.max) {
          errors.push(`${field.label} deve ser no máximo ${field.validations.max}`);
        }
      }
      break;

    case 'DATE':
      const dateValue = new Date(value);
      if (isNaN(dateValue.getTime())) {
        errors.push(`${field.label} deve ser uma data válida`);
      }
      break;

    case 'SELECT':
    case 'CHECKBOX':
      if (field.options && !field.options.includes(String(value))) {
        errors.push(`${field.label} tem uma opção inválida`);
      }
      break;

    case 'FILE_UPLOAD':
      if (field.validations?.maxFileSize) {
        const sizeInMB = value.size / (1024 * 1024);
        if (sizeInMB > field.validations.maxFileSize) {
          errors.push(`${field.label} deve ser menor que ${field.validations.maxFileSize}MB`);
        }
      }
      break;
  }

  return { isValid: errors.length === 0, errors };
};

// ADVANCED REGEX VALIDATION
export const validateWithRegex = (value: string, pattern: string): boolean => {
  try {
    const regex = new RegExp(pattern);
    return regex.test(value);
  } catch (err) {
    console.error('Invalid regex pattern:', err);
    return false;
  }
};

// BUILTIN PATTERNS
export const validateEmail = (email: string): boolean => PATTERNS.email.test(email);
export const validatePhone = (phone: string): boolean => PATTERNS.phone.test(phone);
export const validateURL = (url: string): boolean => PATTERNS.url.test(url);
export const validateCPF = (cpf: string): boolean => PATTERNS.cpf.test(cpf);
export const validateCNPJ = (cnpj: string): boolean => PATTERNS.cnpj.test(cnpj);

// CONDITIONAL LOGIC
export interface ConditionalRule {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'in';
  value: any;
  action: 'show' | 'hide' | 'disable' | 'enable';
  targetFieldId: string;
}

export const evaluateCondition = (rule: ConditionalRule, fieldValue: any): boolean => {
  switch (rule.operator) {
    case 'equals':
      return fieldValue === rule.value;
    case 'notEquals':
      return fieldValue !== rule.value;
    case 'contains':
      return String(fieldValue).includes(String(rule.value));
    case 'greaterThan':
      return Number(fieldValue) > Number(rule.value);
    case 'lessThan':
      return Number(fieldValue) < Number(rule.value);
    case 'in':
      return Array.isArray(rule.value) ? rule.value.includes(fieldValue) : false;
    default:
      return true;
  }
};

export const applyConditionalLogic = (
  fields: FormElement[],
  answers: Record<string, any>,
  rules: ConditionalRule[]
): Record<string, 'hidden' | 'visible' | 'disabled' | 'enabled'> => {
  const fieldVisibility: Record<string, 'hidden' | 'visible' | 'disabled' | 'enabled'> = {};

  // Initialize all fields as visible and enabled
  fields.forEach(field => {
    fieldVisibility[field.id] = 'visible';
  });

  // Apply conditional rules
  rules.forEach(rule => {
    const fieldValue = answers[rule.fieldId];
    if (evaluateCondition(rule, fieldValue)) {
      fieldVisibility[rule.targetFieldId] = rule.action === 'show' || rule.action === 'enable' ? 'visible' : 'hidden';
    }
  });

  return fieldVisibility;
};

// CROSS-FIELD VALIDATION
export const validateFormResponses = (
  fields: FormElement[],
  answers: Record<string, any>,
  customValidations?: ((answers: Record<string, any>) => string[])[]
): ValidationResult => {
  const errors: string[] = [];

  // Field-level validation
  fields.forEach(field => {
    const result = validateField(answers[field.id], field);
    errors.push(...result.errors);
  });

  // Custom validation rules
  if (customValidations) {
    customValidations.forEach(validator => {
      const customErrors = validator(answers);
      errors.push(...customErrors);
    });
  }

  return { isValid: errors.length === 0, errors };
};

// DYNAMIC FIELD DEPENDENCIES
export const getFieldDependencies = (field: FormElement, rules: ConditionalRule[]): string[] => {
  return rules
    .filter(rule => rule.targetFieldId === field.id)
    .map(rule => rule.fieldId);
};

export const getDependentFields = (fieldId: string, rules: ConditionalRule[]): string[] => {
  return rules
    .filter(rule => rule.fieldId === fieldId)
    .map(rule => rule.targetFieldId);
};

// VALIDATION SUMMARY
export const getValidationSummary = (
  fields: FormElement[],
  answers: Record<string, any>
): { field: string; validCount: number; invalidCount: number }[] => {
  return fields.map(field => {
    const result = validateField(answers[field.id], field);
    return {
      field: field.label || field.id,
      validCount: result.isValid ? 1 : 0,
      invalidCount: result.isValid ? 0 : 1
    };
  });
};

export default {
  validateField,
  validateEmail,
  validatePhone,
  validateURL,
  validateCPF,
  validateCNPJ,
  evaluateCondition,
  applyConditionalLogic,
  validateFormResponses,
  getFieldDependencies,
  getDependentFields,
  getValidationSummary
};
