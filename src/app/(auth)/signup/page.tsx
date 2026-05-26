import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <h1 className="mb-6 text-2xl font-semibold">Vytvořit účet rodiče</h1>
      <SignupForm />
    </div>
  );
}
