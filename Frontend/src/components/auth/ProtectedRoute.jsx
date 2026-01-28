import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // 1. Jika tidak ada token, tendang ke halaman login (/)
  if (!token || !user) {
    return <Navigate to="/" />;
  }

  // 2. Jika role user tidak ada dalam daftar allowedRoles, balikkan ke Beranda
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/beranda" />;
  }

  return children;
};

export default ProtectedRoute;