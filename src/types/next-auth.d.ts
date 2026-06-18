import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/constants";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      firstName?: string;
      lastName?: string;
    };
  }

  interface User {
    id: string;
    role: Role;
    firstName?: string;
    lastName?: string;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    firstName?: string;
    lastName?: string;
    image?: string | null;
  }
}

export {};
