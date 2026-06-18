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

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-xl border-border/70 bg-background/80 shadow-xl backdrop-blur-xl">
        <CardHeader className="space-y-4">
          <Badge variant="destructive" className="w-fit">
            Unauthorized
          </Badge>
          <div>
            <CardTitle>Unauthorized</CardTitle>
            <CardDescription className="mt-2">
              You do not have permission to access this page.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
