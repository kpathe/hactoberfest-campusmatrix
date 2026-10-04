import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateProfile from "./pages/CreateProfile";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Matching from "./pages/Matching";
import Goals from "./pages/Goals";
import Messages from "./pages/Messages";
import Connect from "./pages/Connect";
import Resources from "./pages/Resources";
import Events from "./pages/Events";
import Leaderboard from "./pages/Leaderboard";
import AdminDashboard from "./pages/AdminDashboard";
import News from "./pages/News";
import Notifications from "./pages/Notifications";
import FollowList from "./pages/FollowList";

const THEME_STORAGE_KEY = "campus-matrix-theme";

function App() {
  const [user, setUser] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY) || "system";
    } catch (error) {
      console.warn("localStorage access denied, defaulting to system theme.");
      return "system";
    }
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setCheckedAuth(true);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const resolvedTheme =
        theme === "system" ? (mediaQuery.matches ? "dark" : "light") : theme;

      root.classList.toggle("dark", resolvedTheme === "dark");
      root.dataset.theme = resolvedTheme;
      root.style.colorScheme = resolvedTheme;
    };

    applyTheme();

    const handleThemeChange = () => applyTheme();
    mediaQuery.addEventListener("change", handleThemeChange);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn("localStorage access denied, cannot save theme.");
    }

    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, [theme]);

  if (!checkedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Router>
        <Navbar user={user} setUser={setUser} theme={theme} setTheme={setTheme} />
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <>
                  <Landing />
                  <Features />
                  <Testimonials />
                  <Footer />
                </>
              )
            }
          />

          <Route path="/auth/login" element={<Login setUser={setUser} />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/me" element={<Home />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-profile"
            element={
              <ProtectedRoute user={user}>
                <CreateProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <Profile setUser={setUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:type"
            element={
              <ProtectedRoute user={user}>
                <FollowList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/connect"
            element={
              <ProtectedRoute user={user}>
                <Connect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matching"
            element={
              <ProtectedRoute user={user}>
                <Matching />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute user={user}>
                <Goals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute user={user}>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute user={user}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute user={user}>
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute user={user}>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute user={user}>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/news"
            element={
              <ProtectedRoute user={user}>
                <News />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:username"
            element={
              <ProtectedRoute user={user}>
                <PublicProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:username/:type"
            element={
              <ProtectedRoute user={user}>
                <FollowList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={document.documentElement.classList.contains("dark") ? "dark" : "light"}
      />
    </>
  );
}

export default App;
