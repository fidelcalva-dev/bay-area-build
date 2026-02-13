import { Navigate } from 'react-router-dom';

/**
 * /staff route — redirects CRM staff to /app (role router)
 */
export default function StaffLogin() {
  return <Navigate to="/app" replace />;
}
