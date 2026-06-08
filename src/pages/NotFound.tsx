import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: Route nicht gefunden:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Seite nicht gefunden</p>
        <a href="/" className="text-[#c6271c] underline hover:text-[#aa2117]">
          Zur Startseite
        </a>
      </div>
    </div>
  );
};

export default NotFound;
