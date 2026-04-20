"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: null,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-navy">MawarBiru</h1>
          <p className="mt-1 text-sm text-navy/60">Panel Pentadbir</p>
        </div>

        <Card className="border border-navy/10 bg-white shadow-elevated">
          <CardHeader>
            <h2 className="text-lg font-semibold text-navy">Log Masuk</h2>
          </CardHeader>

          <form action={formAction}>
            <CardBody className="flex flex-col gap-4">
              {state.error && (
                <div
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {state.error}
                </div>
              )}

              <Input
                label="E-mel"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@mawarbiru.com"
              />

              <Input
                label="Kata Laluan"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Masukkan kata laluan"
              />
            </CardBody>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                loading={isPending}
              >
                Log Masuk
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
