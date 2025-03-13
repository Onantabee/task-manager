import React from "react";
import Header from "./Header";

const Layout = ({ children, setIsSignup }) => {
  return (
    <div>
      <Header setIsSignup={setIsSignup} />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
