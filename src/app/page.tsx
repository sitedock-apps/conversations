import { LoginForm } from "@/components/auth/login-form";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const authError = params.error === "auth_callback_error";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <LoginForm
        initialError={
          authError
            ? "Your magic link has expired or was already used. Please request a new one."
            : undefined
        }
      />
    </main>
  );
}
