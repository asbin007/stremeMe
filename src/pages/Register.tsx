import React from "react";
import { SignUp } from "@clerk/react";
import { Helmet } from "react-helmet-async";
import AuthLayout from "../components/AuthLayout";

const Register: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Create an account — AuraScreen</title>
        <meta
          name="description"
          content="Create a free AuraScreen account to build a watchlist, save favourites, and keep your viewing history in sync."
        />
        <meta name="robots" content="noindex" />
      </Helmet>

      <AuthLayout
        title="Create your account"
        subtitle="Save favourites and sync your watchlist across devices."
      >
        {/* Theming comes from the shared appearance on ClerkProvider. */}
        <SignUp routing="path" path="/register" signInUrl="/login" />
      </AuthLayout>
    </>
  );
};

export default Register;
