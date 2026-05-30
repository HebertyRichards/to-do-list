"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Algo deu errado.</h1>
        <p className="text-sm">Recarregue a página ou tente novamente.</p>
        <button
          onClick={() => reset()}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
