export function validateInputs(inputs, rules) {
  let isValid = true;
  const errors = {};

  for (const rule in rules) {
    for (const { fn, message } of rules[rule]) {
      const res = fn(inputs[rule], inputs);
      if (res === false) {
        isValid = false;
        errors[rule] = message;
      }
    }
  }

  return { isValid, errors };
}
