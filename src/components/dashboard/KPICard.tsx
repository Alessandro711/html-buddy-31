import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  showVariation?: boolean;
  title: string;
  value: string;
  variation: number;
  icon: React.ReactNode;
  prefix?: string;
  comparisonLabel?: string;
  subtitle?: string;        // e.g. "1.5% Sob. Faturamento"
  subtitleAccent?: string;  // the highlighted part (e.g. "1.5%")
}

const KPICard = ({ title, value, variation, icon, prefix = "", comparisonLabel = "vs mês anterior", subtitle, showVariation = true }: KPICardProps) => {
  const isPositive = variation >= 0;

  // Parse subtitle: if it matches "X% Sob. Faturamento", split into accent + rest
  let subtitleNode: React.ReactNode = null;
  if (subtitle) {
    const match = subtitle.match(/^([\d.,]+%)\s+(.+)$/);
    if (match) {
      subtitleNode = (
        <p className="text-xs mt-1 flex items-center gap-1">
          <span className="font-semibold text-[hsl(var(--success))]">{match[1]}</span>
          <span className="text-muted-foreground">{match[2]}</span>
        </p>
      );
    } else {
      subtitleNode = (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      );
    }
  }

  return (
    <Card className="border-none bg-card shadow-md transition-shadow duration-300 hover:shadow-lg w-full">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p
              className="font-sans font-bold text-foreground leading-tight mt-1"
              style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", whiteSpace: "nowrap" }}
            >
              {prefix}{value}
            </p>
            {subtitleNode}
          </div>
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary flex-shrink-0">
            {icon}
          </div>
        </div>
        {showVariation && (
        <div className="mt-3 flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span className={cn("text-sm font-medium", isPositive ? "text-[hsl(var(--success))]" : "text-destructive")}>
            {isPositive ? "+" : ""}{variation}%
          </span>
          <span className="text-xs text-muted-foreground">{comparisonLabel}</span>
        </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
