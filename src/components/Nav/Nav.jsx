import { Link, NavLink } from 'react-router-dom';

import styles from './Nav.module.css';
import clsx from 'clsx';

function BrandNavLink({ className, children, ...rest }) {
  return (
    <NavLink
      className={({ isActive }) =>
        clsx(className, { [styles.activeLink]: isActive })
      }
      {...rest}
    >
      {children}
    </NavLink>
  );
}

export function Nav() {
  return (
    <nav className={styles.mainNav}>
      <Link to="/" className={styles.logo}>
        Final Project
      </Link>
      <menu>
        <li>
          <BrandNavLink to="/">Home</BrandNavLink>
        </li>
        <li>
          <BrandNavLink to="products">Products</BrandNavLink>
        </li>
      </menu>
      <menu>
        <li>
          <BrandNavLink to="/login">Login</BrandNavLink>
        </li>
        <li>
          <BrandNavLink to="/register">Register</BrandNavLink>
        </li>
      </menu>
    </nav>
  );
}
