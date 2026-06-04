import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, TrendingUpIcon, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface DashboardStats {
  totalWalletBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  totalInvestments: number;
  cashFlow: number;
  netWorth: number;
  topCategories: Array<{ category: string; amount: number }>;
  walletsCount: number;
  savingsGoals: number;
  investmentsCount: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [statsData, txData]: any = await Promise.all([
        api.getDashboardStats(),
        api.getTransactions(),
      ]);
      setStats(statsData);
      setTransactions(txData.transactions.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600">Failed to load dashboard data</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Saldo Dompet',
      value: stats.totalWalletBalance,
      icon: Wallet,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Pemasukan Bulan Ini',
      value: stats.monthlyIncome,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Pengeluaran Bulan Ini',
      value: stats.monthlyExpenses,
      icon: TrendingDown,
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      bgLight: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Total Tabungan',
      value: stats.totalSavings,
      icon: PiggyBank,
      color: 'bg-purple-500',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Total Investasi',
      value: stats.totalInvestments,
      icon: TrendingUpIcon,
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      title: 'Cash Flow Bulan Ini',
      value: stats.cashFlow,
      icon: DollarSign,
      color: stats.cashFlow >= 0 ? 'bg-emerald-500' : 'bg-red-500',
      textColor: stats.cashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
      bgLight: stats.cashFlow >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  const incomeVsExpenseData = [
    { name: 'Bulan Ini', Pemasukan: stats.monthlyIncome, Pengeluaran: stats.monthlyExpenses },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];

  const categoryData = stats.topCategories.map((cat, index) => ({
    name: cat.category,
    value: cat.amount,
    color: COLORS[index % COLORS.length],
  }));

  const allocationData = [
    { name: 'Dompet', value: stats.totalWalletBalance, color: '#3b82f6' },
    { name: 'Tabungan', value: stats.totalSavings, color: '#8b5cf6' },
    { name: 'Investasi', value: stats.totalInvestments, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Ringkasan keuangan Anda</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>
                    {formatCurrency(card.value)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${card.bgLight} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Pemasukan vs Pengeluaran
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeVsExpenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="Pemasukan" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Categories */}
        {categoryData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Top Kategori Pengeluaran
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Allocation */}
        {allocationData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Alokasi Keuangan
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Transaksi Terakhir</h2>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{tx.description}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {tx.type === 'income' && 'Pemasukan'}
                    {tx.type === 'expense' && 'Pengeluaran'}
                    {tx.type === 'transfer' && 'Transfer'}
                    {tx.type === 'savings_deposit' && 'Setor Tabungan'}
                    {tx.type === 'savings_withdraw' && 'Tarik Tabungan'}
                    {tx.type === 'investment_buy' && 'Beli Investasi'}
                    {tx.type === 'investment_sell' && 'Jual Investasi'}
                    {tx.type === 'initial_balance' && 'Saldo Awal'}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      tx.type === 'income' || tx.type === 'savings_withdraw' || tx.type === 'investment_sell'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {tx.type === 'income' || tx.type === 'savings_withdraw' || tx.type === 'investment_sell' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(tx.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-600 dark:text-slate-400 py-8">Belum ada transaksi</p>
        )}
      </div>

      {/* Net Worth Summary */}
      <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">Total Kekayaan Bersih (Net Worth)</h2>
        <p className="text-4xl font-bold">{formatCurrency(stats.netWorth)}</p>
        <p className="text-emerald-100 mt-2">
          {stats.walletsCount} Dompet • {stats.savingsGoals} Tabungan • {stats.investmentsCount} Investasi
        </p>
      </div>
    </div>
  );
}
