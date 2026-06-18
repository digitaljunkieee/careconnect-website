import { auth } from "@/auth";
import { ROLE_HOME } from "@/lib/constants";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.role) {
    redirect(ROLE_HOME[session.user.role]);
  }

  return <LoginForm />;
}
