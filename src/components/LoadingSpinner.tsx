export default function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background" role="status">
      <div className="size-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      <span className="sr-only">Carregando</span>
    </div>
  );
}
