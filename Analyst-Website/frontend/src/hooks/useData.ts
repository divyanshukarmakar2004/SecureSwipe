import { useQuery } from '@tanstack/react-query';
import { 
  usersAPI, 
  transactionsAPI, 
  flaggedTransactionsAPI, 
  analyticsAPI,
  type User,
  type Transaction,
  type FlaggedTransaction,
  type TransactionChartData,
  type IPAddressData,
  type DashboardSummary,
  type LocationAnalytics
} from '@/services/api';

// Users hooks
export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: usersAPI.getAll,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
};

export const useUser = (id: string) => {
  return useQuery<User>({
    queryKey: ['user', id],
    queryFn: () => usersAPI.getById(id),
    enabled: !!id,
  });
};

export const useUserStats = (id: string) => {
  return useQuery({
    queryKey: ['user-stats', id],
    queryFn: () => usersAPI.getStats(id),
    enabled: !!id,
  });
};

// Transactions hooks
export const useTransactions = () => {
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: transactionsAPI.getAll,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

export const useUserTransactions = (userId: string) => {
  return useQuery<Transaction[]>({
    queryKey: ['user-transactions', userId],
    queryFn: () => transactionsAPI.getByUserId(userId),
    enabled: !!userId,
  });
};

export const useTransactionStats = () => {
  return useQuery({
    queryKey: ['transaction-stats'],
    queryFn: transactionsAPI.getStats,
    staleTime: 30000,
  });
};

// Flagged Transactions hooks
export const useFlaggedTransactions = () => {
  return useQuery<FlaggedTransaction[]>({
    queryKey: ['flagged-transactions'],
    queryFn: flaggedTransactionsAPI.getAll,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

export const useUserFlaggedTransactions = (userId: string) => {
  return useQuery<FlaggedTransaction[]>({
    queryKey: ['user-flagged-transactions', userId],
    queryFn: () => flaggedTransactionsAPI.getByUserId(userId),
    enabled: !!userId,
  });
};

export const useFlaggedTransactionsByIP = (ipAddress: string) => {
  return useQuery<FlaggedTransaction[]>({
    queryKey: ['flagged-transactions-ip', ipAddress],
    queryFn: () => flaggedTransactionsAPI.getByIP(ipAddress),
    enabled: !!ipAddress,
  });
};

export const useTopIPs = () => {
  return useQuery<IPAddressData[]>({
    queryKey: ['top-ips'],
    queryFn: flaggedTransactionsAPI.getTopIPs,
    staleTime: 30000,
  });
};

export const useFlaggedTransactionStats = () => {
  return useQuery({
    queryKey: ['flagged-transaction-stats'],
    queryFn: flaggedTransactionsAPI.getStats,
    staleTime: 30000,
  });
};

// Analytics hooks
export const useTransactionChart = () => {
  return useQuery<TransactionChartData[]>({
    queryKey: ['transaction-chart'],
    queryFn: analyticsAPI.getTransactionChart,
    staleTime: 30000,
  });
};

export const useIPChart = () => {
  return useQuery<IPAddressData[]>({
    queryKey: ['ip-chart'],
    queryFn: analyticsAPI.getIPChart,
    staleTime: 30000,
  });
};

export const useDashboardSummary = () => {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: analyticsAPI.getDashboardSummary,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

export const useLocationAnalytics = () => {
  return useQuery<LocationAnalytics[]>({
    queryKey: ['location-analytics'],
    queryFn: analyticsAPI.getLocationAnalytics,
    staleTime: 30000,
  });
};

// Combined data hooks for pages
export const useUsersPageData = () => {
  const users = useUsers();
  const transactions = useTransactions();
  const flaggedTransactions = useFlaggedTransactions();

  return {
    users: users.data || [],
    transactions: transactions.data || [],
    flaggedTransactions: flaggedTransactions.data || [],
    isLoading: users.isLoading || transactions.isLoading || flaggedTransactions.isLoading,
    error: users.error || transactions.error || flaggedTransactions.error,
  };
};

export const useChartsPageData = () => {
  const ipChart = useIPChart();
  const flaggedTransactions = useFlaggedTransactions();

  return {
    ipChart: ipChart.data || [],
    flaggedTransactions: flaggedTransactions.data || [],
    isLoading: ipChart.isLoading || flaggedTransactions.isLoading,
    error: ipChart.error || flaggedTransactions.error,
  };
};

