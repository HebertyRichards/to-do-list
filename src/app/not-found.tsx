import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-foreground-muted">Página não encontrada.</p>
      <Link href="/dashboard" className="text-primary hover:underline">
        Voltar ao início
      </Link>
    </main>
  );
}
