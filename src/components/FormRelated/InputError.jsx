export function InputError({ message }) {
  if (!message) {
    return null;
  }

  return <div className="inputError">{message}</div>;
}
