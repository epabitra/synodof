/**
 * Admin Login Page
 * Secure authentication for admin access
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { isValidEmail } from '@/utils/validation';
import { ROUTES } from '@/config/constants';
import { Helmet } from 'react-helmet-async';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || ROUTES.ADMIN_DASHBOARD;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError('');

      const result = await login(data.email, data.password);

      if (result.success) {
        const from = location.state?.from?.pathname || ROUTES.ADMIN_DASHBOARD;
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login</title>
      </Helmet>

      <div className="admin-login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">
                <span className="logo-icon">✍️</span>
                <h1>Admin Panel</h1>
              </div>
              <p className="login-subtitle">Sign in to manage your content</p>
            </div>

            {error && (
              <div className="error-message">
                {error.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  {...register('email', {
                    required: 'Email is required',
                    validate: (value) => isValidEmail(value) || 'Invalid email address',
                  })}
                  autoComplete="email"
                />
                {errors.email && <span className="error">{errors.email.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <span className="error">{errors.password.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="login-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;

