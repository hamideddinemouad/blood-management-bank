import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser, handleAuthError } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      try {
        const user = await fetchCurrentUser();

        if (!user) {
          handleAuthError(navigate);
          return;
        }

        if (!cancelled) {
          setIsAllowed(true);
        }
      } catch (error) {
        if (!cancelled) {
          handleAuthError(navigate);
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (isChecking) {
    return null;
  }

  return isAllowed ? children : null;
};

export default ProtectedRoute;
