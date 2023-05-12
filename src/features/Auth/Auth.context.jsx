import { createContext, useContext } from 'react';
import { useLocalStorageState } from '~/hooks/useLocalStorageState';

const AuthContext = createContext(null);
const initialValue = {
  accessToken: null,
  user: null,
};

export function AuthContextProvider({ children }) {
  const [auth, setAuth] = useLocalStorageState('auth', initialValue);

  function login(auth) {
    setAuth(auth);
  }

  function logout() {
    setAuth(initialValue);
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error(
      'The useAuth hook needs to be used inside a child of AuthContextProvider.'
    );
  }
  return ctx;
}
