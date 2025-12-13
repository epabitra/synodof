/**
 * Theme Toggle Component
 * Button to switch between light and dark mode
 */

import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <span style={{ fontSize: '1.25rem' }}>🌙</span>
      ) : (
        <span style={{ fontSize: '1.25rem' }}>☀️</span>
      )}
    </button>
  );
};

export default ThemeToggle;

