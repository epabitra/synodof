/**
 * Main App Component
 * Sets up routing, context providers, and global configuration
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from '@/components/ScrollToTop';
import { ROUTES } from '@/config/constants';

// Layouts
import MainLayout from '@/components/Layout/MainLayout';

// Public Pages
import Home from '@/pages/Home';
import About from '@/pages/About';
import BlogList from '@/pages/BlogList';
import BlogDetail from '@/pages/BlogDetail';
import Portfolio from '@/pages/Portfolio';
import Contact from '@/pages/Contact';

// Admin Pages
import AdminLogin from '@/pages/Admin/Login';
import AdminDashboard from '@/pages/Admin/Dashboard';
import AdminPostList from '@/pages/Admin/PostList';
import AdminPostEditor from '@/pages/Admin/PostEditor';
import AdminCategoryList from '@/pages/Admin/CategoryList';
import AdminCategoryEditor from '@/pages/Admin/CategoryEditor';
import AdminAwardList from '@/pages/Admin/AwardList';
import AdminAwardEditor from '@/pages/Admin/AwardEditor';
import AdminPublicationList from '@/pages/Admin/PublicationList';
import AdminPublicationEditor from '@/pages/Admin/PublicationEditor';
import AdminProfileEditor from '@/pages/Admin/ProfileEditor';
import AdminLayout from '@/components/Layout/AdminLayout';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter basename={import.meta.env.PROD ? "/synodof" : ""} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route
                path={ROUTES.HOME}
                element={
                  <MainLayout>
                    <Home />
                  </MainLayout>
                }
              />
              <Route
                path={ROUTES.ABOUT}
                element={
                  <MainLayout>
                    <About />
                  </MainLayout>
                }
              />
              <Route
                path={ROUTES.BLOG}
                element={
                  <MainLayout>
                    <BlogList />
                  </MainLayout>
                }
              />
              <Route
                path={ROUTES.BLOG_DETAIL}
                element={
                  <MainLayout>
                    <BlogDetail />
                  </MainLayout>
                }
              />
              <Route
                path={ROUTES.PORTFOLIO}
                element={
                  <MainLayout>
                    <Portfolio />
                  </MainLayout>
                }
              />
              <Route
                path={ROUTES.CONTACT}
                element={
                  <MainLayout>
                    <Contact />
                  </MainLayout>
                }
              />

              {/* Admin Routes */}
              <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
              
              <Route
                path={ROUTES.ADMIN_DASHBOARD}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_POSTS}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminPostList />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_POST_NEW}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminPostEditor />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_POST_EDIT}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminPostEditor />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_CATEGORIES}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminCategoryList />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_CATEGORY_NEW}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminCategoryEditor />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_CATEGORY_EDIT}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminCategoryEditor />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_AWARDS}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminAwardList />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_AWARD_NEW}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminAwardEditor />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_AWARD_EDIT}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminAwardEditor />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_PUBLICATIONS}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminPublicationList />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_PUBLICATION_NEW}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminPublicationEditor />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_PUBLICATION_EDIT}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminPublicationEditor />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_PROFILE}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminProfileEditor />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>

            {/* Toast notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;

