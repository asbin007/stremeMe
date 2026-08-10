import React from "react";
import { SignIn } from "@clerk/react";
import { SEOHead } from "../components/SEOHead";
import AuthLayout from "../components/AuthLayout";

const Login: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Sign in — AuraScreen"
        description="Sign in to AuraScreen to sync your watchlist, favourites, and viewing history across devices."
        noindex={true}
      />

      <AuthLayout
        title="Welcome back"
        subtitle="Sign in to pick up where you left off."
      >
        {/* Theming comes from the shared appearance on ClerkProvider. */}
        <SignIn routing="path" path="/login" signUpUrl="/register" />
      </AuthLayout>
    </>
  );
};

export default Login;
