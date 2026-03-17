import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  variation: number;
  icon: React.ReactNode;
  prefix?: string;
}

const KPICard = ({ title, value, variation, icon, prefix = "" }: KPICardProps) => {
  const isPositive = variation >= 0;

  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground font-sans">
              {prefix}{value}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              isPositive ? "text-[hsl(var(--success))]" : "text-destructive"
            )}
          >
            {isPositive ? "+" : ""}{variation}%
          </span>
          <span className="text-xs text-muted-foreground">vs mês anterior</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
