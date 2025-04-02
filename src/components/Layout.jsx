import React from "react";
import Header from "./Header";

const Layout = ({ children, setIsSignup }) => {
  return (
    <div>
      <Header setIsSignup={setIsSignup} />
      <main className="max-w-[1500px] mx-auto">{children}</main>
    </div>
  );
};

export default Layout;
