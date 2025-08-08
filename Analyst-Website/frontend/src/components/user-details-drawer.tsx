import { useState } from "react";
import { User, mockTransactions, mockFlaggedTransactions } from "@/data/mockData";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, X, DollarSign, MapPin, Calendar, Wifi } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface UserDetailsDrawerProps {
  user: User;
}

export function UserDetailsDrawer({ user }: UserDetailsDrawerProps) {
  const [open, setOpen] = useState(false);

  // Get user's transactions
  const userTransactions = mockTransactions.filter(tx => tx.userId === user.id);
  const userFlaggedTransactions = mockFlaggedTransactions.filter(tx => tx.userId === user.id);

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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          Details
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-semibold">User Details</DrawerTitle>
              <p className="text-sm text-muted-foreground">{user.id}</p>
            </div>
            <DrawerClose asChild>
              <Button variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="p-6 overflow-y-auto">
          {/* User Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <div className="w-8 h-8 flex items-center justify-center">
                  {getRiskBadge(user.riskLevel)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className="text-sm font-medium text-foreground">{user.riskLevel.toUpperCase()}</p>
                </div>
              </div>
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
      </DrawerContent>
    </Drawer>
  );
}