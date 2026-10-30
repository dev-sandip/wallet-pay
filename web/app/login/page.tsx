"use client";

import LoginForm from "@/components/login/login-form";
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

  return <LoginForm />;
};

export default Page;
