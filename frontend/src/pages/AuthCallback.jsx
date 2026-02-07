import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../services/auth";

export default function AuthCallback({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const processingRef = useRef(false);

  useEffect(() => {
    if (processingRef.current) return;
    processingRef.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      auth.setToken(token);
      // Fetch user data
      auth.me().then((user) => {
        if (user) {
          onLogin(user);
          navigate("/");
        } else {
          navigate("/login?error=auth_failed");
        }
      }).catch(() => {
        navigate("/login?error=auth_failed");
      });
    } else {
      navigate("/login?error=no_token");
    }
  }, [location, navigate, onLogin]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="text-gray-500">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
