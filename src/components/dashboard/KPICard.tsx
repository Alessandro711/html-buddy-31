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
    <Card className="border-none bg-card shadow-md transition-shadow duration-300 hover:shadow-lg w-full overflow-hidden">
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground break-words">{title}</p>
            <p
              className="font-sans font-bold text-foreground leading-tight mt-1 break-all"
              style={{ fontSize: "clamp(0.95rem, 4.5vw, 1.5rem)" }}
            >
              {prefix}{value}
            </p>
            {subtitleNode}
          </div>
          <div className="rounded-xl bg-primary/10 p-1.5 sm:p-2.5 text-primary flex-shrink-0">
            {icon}
          </div>
        </div>
        {showVariation && (
        <div className="mt-3 flex items-center gap-1 flex-wrap">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-[hsl(var(--success))] flex-shrink-0" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive flex-shrink-0" />
          )}
          <span className={cn("text-xs sm:text-sm font-medium", isPositive ? "text-[hsl(var(--success))]" : "text-destructive")}>
            {isPositive ? "+" : ""}{variation}%
          </span>
          <span className="text-[11px] sm:text-xs text-muted-foreground break-words">{comparisonLabel}</span>
        </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
