// API service for backend integration

const API_BASE_URL = 'http://localhost:5000/api';

// Types matching backend response
export interface User {
  id: string;
  sendTransactionCount: number;
  flaggedTransactionCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'disabled';
  lastActivity: string;
  name?: string;
  city?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  location: string;
  dateTime: string;
  status: 'success' | 'failed';
  userName?: string;
  userCity?: string;
}

export interface FlaggedTransaction {
  id: string;
  userId: string;
  amount: number;
  location: string;
  date: string;
  ipAddress: string;
  userName?: string;
  userCity?: string;
}

export interface TransactionChartData {
  date: string;
  amount: number;
  count: number;
  flagged: number;
}

export interface IPAddressData {
  ip: string;
  count: number;
}

export interface DashboardSummary {
  totalUsers: number;
  totalTransactions: number;
  totalFlaggedTransactions: number;
  totalAmount: number;
  flaggedAmount: number;
}

export interface LocationAnalytics {
  location: string;
  transactionCount: number;
  totalAmount: number;
  flaggedCount: number;
}

// API Error class
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new APIError(response.status, `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Users API
export const usersAPI = {
  getAll: () => fetchAPI<User[]>('/users'),
  getById: (id: string) => fetchAPI<User>(`/users/${id}`),
  getStats: (id: string) => fetchAPI<any>(`/users/${id}/stats`),
};

// Transactions API
export const transactionsAPI = {
  getAll: () => fetchAPI<Transaction[]>('/transactions'),
  getByUserId: (userId: string) => fetchAPI<Transaction[]>(`/transactions/user/${userId}`),
  getStats: () => fetchAPI<any>('/transactions/stats/summary'),
};

// Flagged Transactions API
export const flaggedTransactionsAPI = {
  getAll: () => fetchAPI<FlaggedTransaction[]>('/flagged-transactions'),
  getByUserId: (userId: string) => fetchAPI<FlaggedTransaction[]>(`/flagged-transactions/user/${userId}`),
  getByIP: (ipAddress: string) => fetchAPI<FlaggedTransaction[]>(`/flagged-transactions/ip/${ipAddress}`),
  getTopIPs: () => fetchAPI<IPAddressData[]>('/flagged-transactions/stats/top-ips'),
  getStats: () => fetchAPI<any>('/flagged-transactions/stats/summary'),
};

// Analytics API
export const analyticsAPI = {
  getTransactionChart: () => fetchAPI<TransactionChartData[]>('/analytics/transaction-chart'),
  getIPChart: () => fetchAPI<IPAddressData[]>('/analytics/ip-chart'),
  getDashboardSummary: () => fetchAPI<DashboardSummary>('/analytics/dashboard-summary'),
  getLocationAnalytics: () => fetchAPI<LocationAnalytics[]>('/analytics/location-analytics'),
};

// Health check
export const healthCheck = () => fetchAPI<{ status: string }>('/health');

