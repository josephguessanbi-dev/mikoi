import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
  subtitle?: string;
}

export const AdminStatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  colorClass = "bg-primary/10 text-primary",
  subtitle,
}: AdminStatsCardProps) => {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="pt-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                <span>{trend.value}%</span>
                <span className="text-muted-foreground">vs mois dernier</span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", colorClass)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
