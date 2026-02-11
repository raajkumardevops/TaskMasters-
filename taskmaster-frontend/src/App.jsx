import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import OAuthSuccess from "./pages/Auth/OAuthSuccess";

// Layout & pages
import NavbarLayout from "./components/NavbarLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Tasks from "./pages/Tasks/Tasks";
import Profile from "./pages/Profile/Profile";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <Router>
      <Routes>

        {/* 🔓 PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        {/* 🔒 PROTECTED ROUTES */}
        <Route element={<NavbarLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* ❌ 404 — MUST BE LAST */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
};

export default App;
