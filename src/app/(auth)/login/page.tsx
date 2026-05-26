import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <h1 className="mb-6 text-2xl font-semibold">Přihlášení rodiče</h1>
      <LoginForm />
    </div>
  );
}
