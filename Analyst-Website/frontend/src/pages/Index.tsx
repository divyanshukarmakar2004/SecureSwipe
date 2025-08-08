import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useDashboardSummary } from "@/hooks/useData";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Activity,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { formatINRAmount } from "@/lib/utils";

interface IndexPageProps {
  onLogout: () => void;
}

const Index = ({ onLogout }: IndexPageProps) => {
  const navigate = useNavigate();
  const { data: summary, isLoading, error } = useDashboardSummary();

  if (error) {
    return (
      <DashboardLayout onLogout={onLogout} pageTitle="Dashboard">
        <div className="space-y-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : 'Failed to load dashboard data from server'}
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
      <DashboardLayout onLogout={onLogout} pageTitle="Dashboard">
        <div className="space-y-6">
          <Loading message="Loading dashboard data..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout onLogout={onLogout} pageTitle="Fraud Detection Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to Fraud Detection Analytics
              </h1>
              <p className="text-muted-foreground text-lg">
                Real-time monitoring and analysis of transaction patterns
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="stat-card">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{summary.totalUsers}</p>
                </div>
              </div>
            </Card>

            <Card className="stat-card">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold text-foreground">{summary.totalTransactions}</p>
                </div>
              </div>
            </Card>

            <Card className="stat-card">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Flagged Transactions</p>
                  <p className="text-2xl font-bold text-destructive">{summary.totalFlaggedTransactions}</p>
                </div>
              </div>
            </Card>

            <Card className="stat-card">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatINRAmount(summary.totalAmount)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => navigate('/users')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">User Management</h3>
                  <p className="text-muted-foreground">View and manage user accounts</p>
                </div>
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/charts')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                  <p className="text-muted-foreground">View detailed charts and analytics</p>
                </div>
                <Activity className="w-6 h-6 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/settings')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Settings</h3>
                  <p className="text-muted-foreground">Configure system settings</p>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-success" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm font-medium">Backend API Connected</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm font-medium">Firebase Database Active</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm font-medium">Real-time Data Sync</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm font-medium">Fraud Detection Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
