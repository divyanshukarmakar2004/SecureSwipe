import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Loading } from "@/components/ui/loading";
import { useUser, useUserTransactions, useUserFlaggedTransactions } from "@/hooks/useData";
import { useSettings } from "@/contexts/SettingsContext";
import { ArrowLeft, DollarSign, MapPin, Calendar, Wifi, TrendingUp, Activity, AlertTriangle, RefreshCw } from "lucide-react";
import type { User } from "@/services/api";
import { formatINR } from "@/lib/utils";

export function UserDetailsPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const { data: user, isLoading: userLoading, error: userError } = useUser(userId || '');
  const { data: userTransactions = [], isLoading: transactionsLoading, error: transactionsError } = useUserTransactions(userId || '');
  const { data: userFlaggedTransactions = [], isLoading: flaggedLoading, error: flaggedError } = useUserFlaggedTransactions(userId || '');
  const { calculateRiskLevel } = useSettings();

  const isLoading = userLoading || transactionsLoading || flaggedLoading;
  const error = userError || transactionsError || flaggedError;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading User Data</h1>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load user data from server'}
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading message="Loading user details..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">User Not Found</h1>
          <Button onClick={() => navigate("/users")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getUserTransactionChartData = () => {
    const allDates = new Set<string>();
    
    userTransactions.forEach(tx => {
      const txDate = tx.dateTime.includes('T') 
        ? tx.dateTime.split('T')[0] 
        : tx.dateTime;
      allDates.add(txDate);
    });
    
    userFlaggedTransactions.forEach(tx => {
      const txDate = tx.date.includes('T') 
        ? tx.date.split('T')[0] 
        : tx.date;
      allDates.add(txDate);
    });
    
    const sortedDates = Array.from(allDates).sort();
    
    if (sortedDates.length === 0) {
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push({
          date: dateStr,
          amount: 0,
          count: 0,
          flagged: 0
        });
      }
      return last7Days;
    }
    
    const chartData = sortedDates.map(dateStr => {
      const dayTransactions = userTransactions.filter(tx => {
        const txDate = tx.dateTime.includes('T') 
          ? tx.dateTime.split('T')[0] 
          : tx.dateTime;
        return txDate === dateStr;
      });
      
      const dayFlagged = userFlaggedTransactions.filter(tx => {
        const txDate = tx.date.includes('T') 
          ? tx.date.split('T')[0] 
          : tx.date;
        return txDate === dateStr;
      });
      
      return {
        date: dateStr,
        amount: dayTransactions.reduce((sum, tx) => sum + tx.amount, 0),
        count: dayTransactions.length,
        flagged: dayFlagged.length
      };
    });
    
    return chartData;
  };

  const userChartData = getUserTransactionChartData();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return formatINR(amount);
  };

  const getStatusBadge = (status: string) => {
    return status === 'success' 
      ? <Badge className="risk-badge-low">Success</Badge>
      : <Badge className="risk-badge-high">Failed</Badge>;
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge className="risk-badge-high">High Risk</Badge>;
      case 'medium':
        return <Badge className="risk-badge-medium">Medium Risk</Badge>;
      case 'low':
        return <Badge className="risk-badge-low">Low Risk</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/users")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">User Details</h1>
              <p className="text-muted-foreground font-mono">{user.id}</p>
              {user.name && (
                <p className="text-sm text-muted-foreground">{user.name}</p>
              )}
              {user.city && (
                <p className="text-sm text-muted-foreground">{user.city}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getRiskBadge(calculateRiskLevel(user.flaggedTransactionCount))}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* User Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="stat-card">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-foreground">{user.sendTransactionCount}</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-center gap-3">
              <Wifi className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Flagged</p>
                <p className="text-2xl font-bold text-destructive">{user.flaggedTransactionCount}</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Last Activity</p>
                <p className="text-sm font-medium text-foreground">{formatDate(user.lastActivity)}</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <p className="text-sm font-medium text-foreground">{calculateRiskLevel(user.flaggedTransactionCount).toUpperCase()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* User-Specific Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Transaction Trends */}
          <Card className="dashboard-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle>Transaction Volume Trends</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
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
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="flagged" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* User Daily Transaction Count */}
          <Card className="dashboard-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-success" />
                <CardTitle>Daily Transaction Count</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
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
                      fill="hsl(var(--success))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Details */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">All Transactions ({userTransactions.length})</TabsTrigger>
            <TabsTrigger value="flagged">Flagged Transactions ({userFlaggedTransactions.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="mt-4">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-lg">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTransactions.length > 0 ? (
                      userTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {transaction.location}
                          </TableCell>
                          <TableCell>{formatDate(transaction.dateTime)}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No transactions found for this user
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="flagged" className="mt-4">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-lg">Flagged Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userFlaggedTransactions.length > 0 ? (
                      userFlaggedTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="border-l-4 border-destructive">
                          <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                          <TableCell className="font-semibold text-destructive">{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-destructive" />
                            <span className="text-destructive">{transaction.location}</span>
                          </TableCell>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell className="font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <Wifi className="w-3 h-3 text-muted-foreground" />
                              {transaction.ipAddress}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No flagged transactions for this user
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}