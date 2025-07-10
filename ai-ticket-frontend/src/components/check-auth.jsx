import { Navigate } from "react-router-dom";

export default function CheckAuth({ children, protected: isProtected }) {
  const token = localStorage.getItem("token");

  if (isProtected && !token) {
    return <Navigate to="/login" />;
  }

  if (!isProtected && token) {
    return <Navigate to="/" />;
  }

  return children;
}
