"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({
  error,
  reset
}: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center px-4 py-12">
          <Card className="w-full max-w-xl border-border/70 bg-background/80 shadow-xl backdrop-blur-xl">
            <CardHeader className="space-y-4">
              <Badge variant="destructive" className="w-fit">
                Error
              </Badge>
              <div>
                <CardTitle>500</CardTitle>
                <CardDescription className="mt-2">
                  Something went wrong. Please try again later.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Button className="w-full" onClick={reset}>
                Try again
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Go home</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </body>
    </html>
  );
}
