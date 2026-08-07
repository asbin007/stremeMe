import React from "react";
import { SignIn } from "@clerk/react";
import { Helmet } from "react-helmet-async";
import AuthLayout from "../components/AuthLayout";

const Login: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Sign in — AuraScreen</title>
        <meta
          name="description"
          content="Sign in to AuraScreen to sync your watchlist, favourites, and viewing history across devices."
        />
        <meta name="robots" content="noindex" />
      </Helmet>

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
