import { strict as assert } from "node:assert";

const baseUrl = (
  process.env.APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.AUTH_URL ??
  "http://localhost:3000"
).replace(/\/+$/, "");

async function fetchPage(path: string, init?: RequestInit) {
  const response = await fetch(new URL(path, baseUrl), init);
  const body = await response.text();
  return { response, body };
}

async function assertPageContains(
  path: string,
  expected: string,
  options?: {
    status?: number;
    redirect?: RequestRedirect;
  }
) {
  const { response, body } = await fetchPage(path, {
    redirect: options?.redirect ?? "follow"
  });

  assert.equal(
    response.status,
    options?.status ?? 200,
    `Expected ${path} to return ${options?.status ?? 200}, received ${response.status}.`
  );
  assert.ok(
    body.includes(expected),
    `Expected ${path} to include "${expected}".`
  );
}

async function main() {
  await assertPageContains(
    "/",
    "Connecting verified care"
  );
  await assertPageContains("/login", "Welcome back");
  await assertPageContains("/login", "Sign in");
  await assertPageContains("/register/worker", "Choose your role");
  await assertPageContains("/register/facility", "Choose your role");
  await assertPageContains(
    "/unauthorized",
    "You do not have permission to access this page."
  );
  await assertPageContains(
    "/does-not-exist",
    "could not be found",
    { status: 404 }
  );

  const { response: dashboardResponse } = await fetchPage("/dashboard/worker", {
    redirect: "manual"
  });

  assert.ok(
    [301, 302, 307, 308].includes(dashboardResponse.status),
    `Expected /dashboard/worker to redirect, received ${dashboardResponse.status}.`
  );

  const location = dashboardResponse.headers.get("location") ?? "";
  assert.ok(
    location.includes("/login"),
    `Expected /dashboard/worker to redirect to login, received "${location}".`
  );

  console.log(`Smoke check passed against ${baseUrl}.`);
}

main().catch((error) => {
  console.error("Smoke check failed:", error);
  process.exit(1);
});
