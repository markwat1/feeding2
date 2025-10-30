import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/feeding', label: '餌やり記録' },
    { path: '/feeding-history', label: '餌やり履歴' },
    { path: '/schedule', label: 'スケジュール管理' },
    { path: '/calendar', label: 'カレンダー' },
    { path: '/pets', label: 'ペット管理' },
    { path: '/maintenance', label: 'メンテナンス' },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <h1 className={styles.title}>ペット管理システム</h1>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.navLink} ${
                  location.pathname === item.path ? styles.active : ''
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};