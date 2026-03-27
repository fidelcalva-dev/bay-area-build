import { Navigate } from 'react-router-dom';

/** Redirect provider login to the main auth flow */
export default function ProviderLogin() {
  return <Navigate to="/admin/login?redirect=/providers/dashboard" replace />;
}
