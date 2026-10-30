"use client";

import SignupForm from "@/components/login/signup-form";
import { authClient } from "@/lib/auth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Page = () => {
  const router = useRouter();
  const session = authClient.useSession();

  useEffect(() => {
    if (session.data?.user) {
      router.replace("/dashboard");
    }
  }, [session.data?.user, router]);

  if (session.isPending || session.data?.user) {
    return <div>Loading...</div>;
  }

  return <SignupForm />;
};

export default Page;
