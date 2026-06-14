import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import ContentTypes from './pages/ContentTypes';
import Entries from './pages/Entries';
import EntryForm from './pages/EntryForm';
import PublicHome from './pages/PublicHome';
import PublicList from './pages/PublicList';
import PublicDetail from './pages/PublicDetail';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <Link to="/site" className="brand">
            Site
          </Link>
          <Link to="/">Admin</Link>
        </div>
        {user && (
          <div className="header-right">
            <span>
              {user.email} ({user.role})
            </span>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </header>
      <main className="content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/site" element={<PublicHome />} />
          <Route path="/site/:contentType" element={<PublicList />} />
          <Route path="/site/:contentType/:id" element={<PublicDetail />} />

          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <ContentTypes />
              </PrivateRoute>
            }
          />
          <Route
            path="/entries/:contentType"
            element={
              <PrivateRoute>
                <Entries />
              </PrivateRoute>
            }
          />
          <Route
            path="/entries/:contentType/:id"
            element={
              <PrivateRoute>
                <EntryForm />
              </PrivateRoute>
            }
          />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}
