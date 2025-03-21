import { Route, Routes } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage"
import NavBar from "./components/NavBar"

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.4)_0%,rgba(10,80,60,0.3)_30%,rgba(0,0,0,0.2)_70%,rgba(0,0,0,0.8)_100%)]" />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,rgba(16,185,129,0.1)_0%,transparent_100%)]" />
        </div>
      </div>
      <div className="relative z-50 pt-20">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
