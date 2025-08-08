import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loading, LoadingTable } from "@/components/ui/loading";
import { useUsersPageData } from "@/hooks/useData";
import { useSettings } from "@/contexts/SettingsContext";
import { Users as UsersIcon, AlertTriangle, TrendingUp, Search, Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { User } from "@/services/api";

interface UsersPageProps {
  onLogout: () => void;
}

export function UsersPage({ onLogout }: UsersPageProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { users, transactions, flaggedTransactions, isLoading, error } = useUsersPageData();
  const { calculateRiskLevel, settings } = useSettings();

  // Filter users based on settings
  let filteredUsers = users;
  
  // Apply search filter
  if (searchTerm) {
    filteredUsers = users.filter(user => 
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.city && user.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
  
  // Apply high-risk only filter if enabled
  if (settings.showHighRiskOnly) {
    filteredUsers = filteredUsers.filter(user => 
      calculateRiskLevel(user.flaggedTransactionCount) === 'high'
    );
  }

  const totalUsers = users.length;
  const totalTransactions = transactions.length;
  const totalFlagged = flaggedTransactions.length;

  const toggleUserStatus = (userId: string) => {
    console.log(`Toggle status for user: ${userId}`);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge className="risk-badge-high bg-red-500 text-white">High</Badge>;
      case 'medium':
        return <Badge className="risk-badge-medium bg-yellow-300 text-white">Medium</Badge>;
      case 'low':
        return <Badge className="risk-badge-low bg-green-500 text-white">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="status-badge-active">Active</Badge>
      : <Badge className="status-badge-disabled">Disabled</Badge>;
  };

  if (error) {
    return (
      <DashboardLayout onLogout={onLogout} pageTitle="User Management">
        <div className="space-y-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Data</h3>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : 'Failed to load data from server'}
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
      <DashboardLayout onLogout={onLogout} pageTitle="User Management">
        <div className="space-y-6">
          <Loading message="Loading users and transaction data..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout onLogout={onLogout} pageTitle="User Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-foreground">{totalUsers}</p>
              </div>
              <UsersIcon className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-3xl font-bold text-foreground">{totalTransactions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flagged Transactions</p>
                <p className="text-3xl font-bold text-destructive">{totalFlagged}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="dashboard-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Users Overview</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">User ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Transactions</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Flagged</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Risk Level</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-card-hover transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-mono text-sm text-foreground">{user.id}</span>
                          {user.name && (
                            <div className="text-xs text-muted-foreground">{user.name}</div>
                          )}
                          {user.city && (
                            <div className="text-xs text-muted-foreground">{user.city}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-foreground">{user.sendTransactionCount}</td>
                      <td className="py-4 px-4">
                        <span className={user.flaggedTransactionCount > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>
                          {user.flaggedTransactionCount}
                        </span>
                      </td>
                      <td className="py-4 px-4">{getRiskBadge(calculateRiskLevel(user.flaggedTransactionCount))}</td>
                      <td className="py-4 px-4">{getStatusBadge(user.status)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={user.status === 'active'}
                            onCheckedChange={() => toggleUserStatus(user.id)}
                            className="data-[state=checked]:bg-success"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => navigate(`/user/${user.id}`)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}