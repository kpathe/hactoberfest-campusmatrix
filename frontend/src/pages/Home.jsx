import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Landing from "../components/Landing";

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          navigate("/dashboard"); // Redirect to dashboard
        }
      } catch {
        // No action, stay on landing
      }
    };

    fetchUser();
  }, []);

  return <Landing />;
};

export default Home;
