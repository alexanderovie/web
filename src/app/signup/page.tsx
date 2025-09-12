import React from "react";

import SignupSection from "@/components/sections/signup-section";

export const metadata = {
  title: "FAQ - Your Questions Answered",
  description:
    "Find answers to commonly asked questions about our platform and services.",
};

const LoginPage = () => {
  return (
    <div className="py-14 md:py-20 lg:py-24">
      <SignupSection />
    </div>
  );
};

export default LoginPage;
