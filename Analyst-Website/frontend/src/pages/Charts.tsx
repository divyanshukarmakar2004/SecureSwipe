import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Loading } from "@/components/ui/loading";
import { useChartsPageData } from "@/hooks/useData";
import { Activity, Shield, Users, RefreshCw, AlertTriangle } from "lucide-react";
import { formatINRAmount } from "@/lib/utils";

interface ChartsPageProps {
  onLogout: () => void;
}

export function ChartsPage({ onLogout }: ChartsPageProps) {
  const { ipChart, flaggedTransactions, isLoading, error } = useChartsPageData();

  // Group flagged transactions by IP address
  const flaggedByIP = flaggedTransactions.reduce((acc, transaction) => {
    const ip = transaction.ipAddress;
    if (!acc[ip]) {
      acc[ip] = [];
    }
    acc[ip].push(transaction);
    return acc;
  }, {} as Record<string, typeof flaggedTransactions>);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--muted))'];

  if (error) {
    return (
      <DashboardLayout onLogout={onLogout} pageTitle="Analytics Dashboard">
        <div className="space-y-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : 'Failed to load analytics data from server'}
                </p>
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout onLogout={onLogout} pageTitle="Analytics Dashboard">
        <div className="space-y-6">
          <Loading message="Loading analytics and chart data..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout onLogout={onLogout} pageTitle="Analytics Dashboard">
      <div className="space-y-6">
        {/* Top Flagged IP Addresses */}
        {ipChart.length > 0 && (
          <Card className="dashboard-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-destructive" />
                <CardTitle>Top Flagged IP Addresses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ipChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="ip" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--destructive))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flagged Transactions by IP Address */}
        {Object.keys(flaggedByIP).length > 0 && (
          <Card className="dashboard-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-destructive" />
              <CardTitle>Flagged Transactions Grouped by IP Address</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(flaggedByIP).map(([ip, transactions]) => (
                <div key={ip} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold font-mono">{ip}</h3>
                      <span className="bg-destructive/10 text-destructive px-2 py-1 rounded-full text-sm font-medium">
                        {transactions.length} transactions
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Amount: {formatINRAmount(transactions.reduce((sum, t) => sum + t.amount, 0))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {transactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="bg-card border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-mono text-xs text-muted-foreground">{transaction.id}</span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {transaction.userName || transaction.userId}
                            </span>
                          </div>
                          <div className="font-semibold text-destructive">{formatINRAmount(transaction.amount)}</div>
                          <div className="text-sm text-muted-foreground">{transaction.location}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </DashboardLayout>
  );
}