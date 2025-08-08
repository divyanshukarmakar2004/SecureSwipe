// Mock data for the fraud detection dashboard

export interface User {
  id: string;
  sendTransactionCount: number;
  flaggedTransactionCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'disabled';
  lastActivity: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  location: string;
  dateTime: string;
  status: 'success' | 'failed';
}

export interface FlaggedTransaction {
  id: string;
  userId: string;
  amount: number;
  location: string;
  date: string;
  ipAddress: string;
}

// Generate mock users
export const mockUsers: User[] = [
  {
    id: "user_001",
    sendTransactionCount: 45,
    flaggedTransactionCount: 3,
    riskLevel: 'high',
    status: 'active',
    lastActivity: '2024-01-15T10:30:00Z'
  },
  {
    id: "user_002", 
    sendTransactionCount: 23,
    flaggedTransactionCount: 1,
    riskLevel: 'medium',
    status: 'active',
    lastActivity: '2024-01-15T09:45:00Z'
  },
  {
    id: "user_003",
    sendTransactionCount: 12,
    flaggedTransactionCount: 0,
    riskLevel: 'low',
    status: 'active',
    lastActivity: '2024-01-15T08:20:00Z'
  },
  {
    id: "user_004",
    sendTransactionCount: 67,
    flaggedTransactionCount: 8,
    riskLevel: 'high',
    status: 'disabled',
    lastActivity: '2024-01-14T16:15:00Z'
  },
  {
    id: "user_005",
    sendTransactionCount: 31,
    flaggedTransactionCount: 2,
    riskLevel: 'medium',
    status: 'active',
    lastActivity: '2024-01-15T11:00:00Z'
  },
  {
    id: "user_006",
    sendTransactionCount: 8,
    flaggedTransactionCount: 0,
    riskLevel: 'low',
    status: 'active',
    lastActivity: '2024-01-15T07:30:00Z'
  }
];

// Generate mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: "txn_001",
    userId: "user_001",
    amount: 1250.00,
    location: "New York, NY",
    dateTime: "2024-01-15T10:30:00Z",
    status: "success"
  },
  {
    id: "txn_002",
    userId: "user_001",
    amount: 750.50,
    location: "Los Angeles, CA",
    dateTime: "2024-01-15T09:15:00Z",
    status: "success"
  },
  {
    id: "txn_003",
    userId: "user_002",
    amount: 300.25,
    location: "Chicago, IL",
    dateTime: "2024-01-15T08:45:00Z",
    status: "failed"
  },
  {
    id: "txn_004",
    userId: "user_003",
    amount: 2000.00,
    location: "Miami, FL",
    dateTime: "2024-01-14T15:20:00Z",
    status: "success"
  },
  {
    id: "txn_005",
    userId: "user_004",
    amount: 500.75,
    location: "Seattle, WA",
    dateTime: "2024-01-14T14:10:00Z",
    status: "success"
  }
];

export const mockFlaggedTransactions: FlaggedTransaction[] = [
  {
    id: "flag_001",
    userId: "user_001",
    amount: 5000.00,
    location: "Unknown Location",
    date: "2024-01-15T10:00:00Z",
    ipAddress: "192.168.1.100"
  },
  {
    id: "flag_002",
    userId: "user_001",
    amount: 3250.50,
    location: "International",
    date: "2024-01-14T22:30:00Z",
    ipAddress: "10.0.0.1"
  },
  {
    id: "flag_003",
    userId: "user_004",
    amount: 10000.00,
    location: "Suspicious Location",
    date: "2024-01-14T16:45:00Z",
    ipAddress: "172.16.0.1"
  },
  {
    id: "flag_004",
    userId: "user_004",
    amount: 7500.25,
    location: "Foreign Country",
    date: "2024-01-13T20:15:00Z",
    ipAddress: "192.168.1.100"
  },
  {
    id: "flag_005",
    userId: "user_002",
    amount: 2500.00,
    location: "High Risk Zone",
    date: "2024-01-13T18:00:00Z",
    ipAddress: "203.0.113.1"
  }
];


export const getTransactionChartData = () => {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    last7Days.push({
      date: dateStr,
      amount: Math.floor(Math.random() * 10000) + 1000,
      count: Math.floor(Math.random() * 50) + 10,
      flagged: Math.floor(Math.random() * 5)
    });
  }
  return last7Days;
};

export const getIPAddressData = () => {
  const ipCounts = mockFlaggedTransactions.reduce((acc, transaction) => {
    acc[transaction.ipAddress] = (acc[transaction.ipAddress] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};