
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-pos-primary/10 p-6 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pos-primary">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" x2="12" y1="8" y2="12"/>
              <line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2 text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <div className="flex gap-4 justify-center">
          <Button asChild className="bg-pos-primary hover:bg-pos-primary/90">
            <Link to="/">Return to POS</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin">Go to Admin</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
