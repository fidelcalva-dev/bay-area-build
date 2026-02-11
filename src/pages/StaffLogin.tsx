import { Navigate } from 'react-router-dom';

/**
 * /staff route — redirects CRM staff to /admin/login
 */
export default function StaffLogin() {
  return <Navigate to="/admin/login" replace />;
}
