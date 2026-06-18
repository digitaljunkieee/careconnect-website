import { auth } from "@/auth";
import { ROLE_HOME } from "@/lib/constants";
import { redirect } from "next/navigation";
import { RegistrationForm } from "@/components/auth/registration-form";

type RegisterPageProps = {
  searchParams?: Promise<{
    role?: string;
  }>;
};

function parseInitialRole(role?: string) {
  if (role?.toUpperCase() === "WORKER") {
    return "WORKER" as const;
  }

  if (role?.toUpperCase() === "FACILITY") {
    return "FACILITY" as const;
  }

  return undefined;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user?.role) {
    redirect(ROLE_HOME[session.user.role]);
  }

  return <RegistrationForm initialRole={parseInitialRole(params?.role)} />;
}
