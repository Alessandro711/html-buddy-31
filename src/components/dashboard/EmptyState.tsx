import { FileSpreadsheet } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-2xl bg-primary/10 p-6 mb-6">
        <FileSpreadsheet className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Nenhum dado financeiro</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Acesse a aba <strong>Lançamentos</strong> para importar seus dados financeiros via Excel ou cadastrar manualmente.
      </p>
    </div>
  );
}
