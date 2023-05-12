import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiArrowRightOnRectangle, HiUserPlus } from 'react-icons/hi2';

import { configureApi } from '~/helpers';
import { useAuth } from '~/features';
import { useBuiltinValidation } from '~/hooks';
import { InputError } from '~/components';

const { create: apiRegister } = configureApi('register');
const { create: apiLogin } = configureApi('login');

const customErrorMessages = {
  email: {
    required: 'Please provide a valid email address',
    type: 'The email address does not appear to be valid',
  },
  password: {
    required: 'Please provide a password',
  },
  firstName: {
    required: 'Please tell us your first name',
  },
  lastName: {
    required: 'Please tell us your last name',
  },
};

const customValidators = {
  retype_password: [
    {
      isValid: (input, inputs) => inputs.password.value === input.value,
      message: 'The passwords did not match',
    },
  ],
};

export function Auth() {
  const { isFormValid, registerField, handleSubmit, errors } =
    useBuiltinValidation(customErrorMessages, customValidators);

  console.count('Render');

  const navigate = useNavigate();

  const { login } = useAuth();

  const { pathname: path } = useLocation();
  const isRegister = path === '/register';

  async function onSubmit(e) {
    const inputs = new FormData(e.target);
    let user = Object.fromEntries(inputs);

    delete user.retype_password;

    const func = isRegister ? apiRegister : apiLogin;

    let auth = await func(user);
    login(auth);
    navigate('/');
  }

  return (
    <>
      <h1>{isRegister ? 'Register' : 'Login'}</h1>
      <form className="pageForm" noValidate onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="email">Email</label>
        <input
          {...registerField('email')}
          required
          id="email"
          type="email"
          className={clsx({ isInvalid: errors.email })}
        />
        <InputError message={errors.email} />

        <label htmlFor="password">Password</label>
        <input
          {...registerField('password')}
          required
          minLength="6"
          id="password"
          type="password"
          className={clsx({ isInvalid: errors.password })}
        />
        <InputError message={errors.password} />

        {isRegister && (
          <>
            <label htmlFor="retype_password">Retype Password</label>
            <input
              {...registerField('retype_password')}
              id="retype_password"
              type="password"
              required
              className={clsx({ isInvalid: errors.retype_password })}
            />
            <InputError message={errors.retype_password} />

            <label htmlFor="firstName">First Name</label>
            <input
              {...registerField('firstName')}
              id="firstName"
              required
              type="text"
              className={clsx({ isInvalid: errors.firstName })}
            />
            <InputError message={errors.firstName} />

            <label htmlFor="lastName">Last Name</label>
            <input
              {...registerField('lastName')}
              id="lastName"
              required
              type="text"
              className={clsx({ isInvalid: errors.lastName })}
            />
            <InputError message={errors.lastName} />
          </>
        )}

        <button className="btn btn--primary submitBtn" disabled={!isFormValid}>
          {isRegister ? 'Register' : 'Login'}
          {isRegister && <HiUserPlus width={20} />}
          {!isRegister && <HiArrowRightOnRectangle width={20} />}
        </button>
      </form>
    </>
  );
}
