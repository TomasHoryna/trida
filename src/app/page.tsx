import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-2xl py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight">trida</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Domácí příprava pro děti 4. a 5. třídy ZŠ.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button asChild>
          <Link href="/login">Přihlásit se</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signup">Vytvořit účet</Link>
        </Button>
      </div>
    </div>
  );
}
