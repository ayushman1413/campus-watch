"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/use-auth";
import Spinner from "./ui/spinner";

const publicRoutes = ["/login", "/signup"];
const completionRoute = "/complete-profile";

export default function AuthGuard({ children }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, initAuth, profile } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublic = publicRoutes.includes(pathname);
    const isCompletionPage = pathname === completionRoute;

    // 1️⃣ Not logged in → block private routes
    if (!user && !isPublic) {
      router.replace("/login");
      return;
    }

    // 2️⃣ Logged in → block login/signup pages
    if (user && isPublic) {
      router.replace("/");
      return;
    }

    // Wait until profile is loaded
    if (user && !profile) return;

    const profileIncomplete =
      !profile?.department || !profile?.semester;

    // 3️⃣ Logged in but profile NOT completed
    if (user && profileIncomplete && !isCompletionPage) {
      router.replace(completionRoute);
      return;
    }

    // 4️⃣ Profile completed but user visiting completion page
    if (user && !profileIncomplete && isCompletionPage) {
      router.replace("/");
      return;
    }

  }, [user, profile, loading, pathname]);
if (loading) {
  return <Spinner fullScreen text="Loading..." />;
}


  return children;
}
