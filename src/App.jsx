import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Importing necessary routing components
import Layout from "./components/Layout";
import RegistrationForm from "./components/RegistrationForm";
import ChooseRole from "./components/ChooseRole";
import Home from "./Home";
import { AuthProvider } from "./AuthProvider";

function App() {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Layout setIsSignup={setIsSignup}>
          <Routes>
            <Route
              path="/"
              element={<RegistrationForm isSignup={isSignup} />}
            />
            <Route path="/choose-role" element={<ChooseRole />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
