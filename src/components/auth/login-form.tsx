"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { ROLE_HOME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: LoginInput) {
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password
      });

      if (!result?.ok || result.error) {
        throw new Error("Invalid email or password.");
      }

      const session = await getSession();
      const role = session?.user?.role;

      if (!role) {
        throw new Error("We could not determine your role.");
      }

      toast.success("Signed in successfully.");
      router.replace(role === "ADMIN" ? "/admin/dashboard" : ROLE_HOME[role]);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-7 text-slate-900">
      <div className="space-y-4">
        <div className="space-y-3">
          <h2 className="font-display text-[clamp(2.15rem,4vw,3rem)] font-semibold leading-tight text-slate-950">
            Welcome back
          </h2>
          <p className="max-w-md text-sm leading-7 text-slate-600 sm:text-base">
            Sign in to manage shifts, applications, and bookings.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-14 rounded-2xl sm:h-12"
                    placeholder="you@example.com"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-3">
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Password
                  </FormLabel>
                  <Link
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    href="mailto:hello@careconnect.co.uk?subject=Password%20reset"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    className="h-14 rounded-2xl sm:h-12"
                    placeholder="Your password"
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="h-14 w-full rounded-2xl sm:h-12"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-sm text-slate-600">
        New to CareConnect?{" "}
        <Link
          className="font-medium text-primary underline-offset-4 hover:underline"
          href="/register"
        >
          Sign up here
        </Link>
        .
      </div>
    </section>
  );
}
