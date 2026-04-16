'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UsageData {
  type: 'EMAIL' | 'SMS';
  used: number;
  limit: number;
  estimatedCost: number;
}

interface CommunicationUsageCardProps {
  data: UsageData[];
}

export function CommunicationUsageCard({ data }: CommunicationUsageCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((usage) => {
        const percentage = Math.min((usage.used / usage.limit) * 100, 100);
        const isCritical = percentage > 90;

        return (
          <Card key={usage.type} className="overflow-hidden border-none bg-white/50 backdrop-blur-md shadow-lg dark:bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {usage.type === 'EMAIL' ? (
                    <Mail className="h-4 w-4 text-blue-500" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-green-500" />
                  )}
                  {usage.type === 'EMAIL' ? 'E-mails' : 'SMS'}
                </CardTitle>
                <CardDescription>Consumo Mensal</CardDescription>
              </div>
              <Badge variant={isCritical ? 'destructive' : 'outline'} className="font-mono">
                {usage.used} / {usage.limit}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-4">
                <Progress value={percentage} className={isCritical ? 'bg-red-100' : 'bg-slate-100'} />
                
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>{percentage.toFixed(1)}% utilizado</span>
                  <span className="font-semibold text-foreground">
                    Custo Est.: R$ {usage.estimatedCost.toFixed(2)}
                  </span>
                </div>

                {isCritical && (
                  <div className="flex items-center gap-2 text-xs text-destructive mt-2 animate-pulse">
                    <AlertCircle className="h-3 w-3" />
                    <span>Lilmite quase atingido. Entre em contato para upgrade.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
