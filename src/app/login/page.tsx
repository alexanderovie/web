import React from "react";

import LoginSection from "@/components/sections/login-section";

export const metadata = {
  title: "FAQ - Your Questions Answered",
  description:
    "Find answers to commonly asked questions about our platform and services.",
};

const LoginPage = () => {
  return (
    <div className="py-14 md:py-20 lg:py-24">
      <LoginSection />
    </div>
  );
};

export default LoginPage;
