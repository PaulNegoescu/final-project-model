import { useCallback, useRef, useState } from 'react';

const criterionMap = {
  patternMismatch: 'pattern',
  tooLong: 'maxLength',
  tooShort: 'minLength',
  rangeOverflow: 'max',
  rangeUnderflow: 'min',
  typeMismatch: 'type',
  valueMissing: 'required',
};

function isCriterionFailed(criterion, field) {
  return field.validity[criterion];
}

function getMessageForFieldAndCriterion(field, criterion, messages) {
  let errorMessage =
    messages &&
    messages[field.name] &&
    messages[field.name][criterionMap[criterion]];
  if (errorMessage) {
    if (typeof errorMessage === 'function') {
      errorMessage = errorMessage(field);
    }
  } else {
    errorMessage = field.validationMessage;
  }
  return errorMessage;
}

function getFirstErrorMessage(field, messages) {
  for (const criterion in field.validity) {
    // 'valid' is not a constraint but a summary of the field's validity state so we skip it
    if (criterion === 'valid') {
      continue;
    }
    if (isCriterionFailed(criterion, field)) {
      return getMessageForFieldAndCriterion(field, criterion, messages);
    }
  }
  // we should never reach this error message
  throw new Error('getFirstErrorMessage invoked for a valid field.');
}

/**
 * Runs all custom validation rules and sets input custom validities (see built-in constraint validation on MDN) in case of errors
 * @param {HTMLFormControlsCollection} fields The elements of the current form
 * @param {{
 *  [inputName: string]: {
 *    isValid: (input: HTMLInputElement, fields: HTMLFormsControlsCollection) => boolean,
 *    message: string
 *  }
 * }} rules An object whose keys are input names and whose values are rule objects consisting of an isValid function and a message.
 * The isValid function receives the current input and all the forms inputs as a collection.
 * It should return true if the current input is valid, false otherwise.
 * The message part of the rules object is used in case isValid returns false as the error message.
 * @returns void
 */
function runCustomValidationRules(fields, rules) {
  first: for (const fieldName in rules) {
    const field = fields[fieldName];
    field.setCustomValidity('');

    for (const rule of rules[fieldName]) {
      const { isValid, message } = rule;

      if (isValid(field, fields) !== true) {
        field.setCustomValidity(message);
        // we only need to fail one criterion no need to check the rest
        continue first;
      }
    }
  }
}

/**
 *
 * @param {{
 *    [inputName: string]: {
 *        [constraintName: string]: string | (field: HTMLInputElement) => string
 *    }
 * }} messages An object whose keys are input names and the values are key value pairs mapping a constraint to a message.
 * The constraint name is the HTMLInput attribute that represents the contraint (e.g. required, min, minLength, pattern, etc.).
 * The message can be a string or a function that receives the input element itself and needs to return a string.
 * @param {{
 *  [inputName: string]: {
 *    isValid: (input: HTMLInputElement, fields: HTMLFormsControlsCollection) => boolean,
 *    message: string
 *  }
 * }} customValidationRules An object whose keys are input names and whose values are rule objects consisting of an isValid function and a message.
 * The isValid function receives the current input and all the forms inputs as a collection.
 * It should return true if the current input is valid, false otherwise.
 * The message part of the rules object is used in case isValid returns false as the error message.
 * @returns {{
 *    registerField: (inputName: string) => {onChange: (e: React.ChangeEvent) => void, onInvalid: (e: React.InvalidEvent) => void, name: string},
 *    handleSubmit: (onSubmit: (e: React.FormEvent) => void) => (e: React.FormEvent) => void,
 *    isFormValid: boolean,
 *    errors: {[inputName: string]: string}
 * }}
 */
export function useBuiltinValidation(messages, customValidationRules) {
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(true);
  const hasFormBeenSubmitted = useRef(false);

  const registerField = useCallback(
    (name) => {
      function onChange(e) {
        if (!hasFormBeenSubmitted.current) {
          return;
        }

        const field = e.target;
        setErrors((old) => {
          const newErrors = { ...old };
          delete newErrors[field.name];
          return newErrors;
        });

        runCustomValidationRules(field.form.elements, customValidationRules);
        const isFormValid = field.form.checkValidity();
        setIsFormValid(isFormValid);
      }

      function onInvalid(e) {
        const field = e.target;

        setErrors((old) => ({
          ...old,
          [field.name]: getFirstErrorMessage(field, messages),
        }));
      }

      return {
        name,
        onChange,
        onInvalid,
      };
    },
    [messages, customValidationRules]
  );

  const handleSubmit = useCallback(
    (onSubmit) => {
      return (e) => {
        e.preventDefault();
        if (customValidationRules) {
          runCustomValidationRules(e.target.elements, customValidationRules);
        }
        const isValid = e.target.checkValidity();

        hasFormBeenSubmitted.current = true;
        setIsFormValid(isValid);

        if (isValid) {
          return onSubmit(e);
        }
      };
    },
    [customValidationRules]
  );

  return {
    registerField,
    errors,
    isFormValid,
    handleSubmit,
  };
}
