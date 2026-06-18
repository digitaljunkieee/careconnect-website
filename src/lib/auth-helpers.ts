import { auth } from "@/auth";
import type { Role } from "@/lib/constants";

export async function requireSessionUser(allowedRoles?: Role[]) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return null;
  }

  return session.user;
}
