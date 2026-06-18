import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { ROLE_HOME, type Role } from "@/lib/constants";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { loginSchema } from "@/lib/validators/auth";

const AUTH_SECRET = process.env.AUTH_SECRET ?? "careconnect-development-secret";

type BackendLoginResponse = {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    name?: string;
    email: string;
    role: Role;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  error?: {
    message?: string;
  };
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const response = await fetch(`${getBackendBaseUrl()}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(parsed.data),
          cache: "no-store"
        });

        const payload = (await response.json().catch(() => null)) as
          | BackendLoginResponse
          | null;

        if (!response.ok || !payload?.success || !payload.data) {
          return null;
        }

        return {
          id: payload.data.id,
          name: payload.data.name ?? "",
          email: payload.data.email,
          role: payload.data.role,
          firstName: payload.data.firstName ?? "",
          lastName: payload.data.lastName ?? "",
          image: payload.data.avatarUrl ?? ""
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.image = user.image ?? token.image ?? null;
      }

      if (trigger === "update") {
        const updatedImage =
          session?.user?.image ?? (session as { image?: string | null } | null | undefined)?.image;

        if (typeof updatedImage === "string") {
          token.image = updatedImage;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as Role) ?? "WORKER";
        session.user.firstName = token.firstName ?? undefined;
        session.user.lastName = token.lastName ?? undefined;
        session.user.name = session.user.name ?? session.user.firstName ?? "";
        session.user.image = typeof token.image === "string" ? token.image : undefined;
      }

      return session;
    }
  },
  events: {
    async signIn({ user }) {
      if (user?.email) {
        console.info(`CareConnect sign-in completed for ${user.email}`);
      }
    }
  },
  logger: {
    error(code, ...message) {
      console.error("[Auth error]", code, ...message);
    },
    warn(code, ...message) {
      console.warn("[Auth warn]", code, ...message);
    },
    debug(code, ...message) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[Auth debug]", code, ...message);
      }
    }
  }
});

export function getRoleHome(role: Role) {
  return ROLE_HOME[role];
}
