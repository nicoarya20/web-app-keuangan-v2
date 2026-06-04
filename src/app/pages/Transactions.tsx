import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { History, Filter } from 'lucide-react';

export function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filter, searchTerm]);

  async function loadData() {
    try {
      const data: any = await api.getTransactions();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }

  function applyFilters() {
    let filtered = [...transactions];

    if (filter !== 'all') {
      filtered = filtered.filter((tx) => tx.type === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tx.walletName && tx.walletName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (tx.category && tx.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredTransactions(filtered);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      income: 'Pemasukan',
      expense: 'Pengeluaran',
      transfer: 'Transfer',
      savings_deposit: 'Setor Tabungan',
      savings_withdraw: 'Tarik Tabungan',
      investment_buy: 'Beli Investasi',
      investment_sell: 'Jual Investasi',
      initial_balance: 'Saldo Awal',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    if (type === 'income' || type === 'savings_withdraw' || type === 'investment_sell') {
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    }
    if (type === 'expense' || type === 'savings_deposit' || type === 'investment_buy') {
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    }
    return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Riwayat Transaksi</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Lihat semua transaksi Anda</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari transaksi..."
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">Semua Transaksi</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
              <option value="transfer">Transfer</option>
              <option value="savings_deposit">Setor Tabungan</option>
              <option value="savings_withdraw">Tarik Tabungan</option>
              <option value="investment_buy">Beli Investasi</option>
              <option value="investment_sell">Jual Investasi</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${getTypeColor(tx.type)}`}
                      >
                        {getTypeLabel(tx.type)}
                      </span>
                      {tx.category && (
                        <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                          {tx.category}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white">{tx.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {tx.walletName && <span>Dompet: {tx.walletName}</span>}
                      {tx.fromWalletName && <span>Dari: {tx.fromWalletName}</span>}
                      {tx.toWalletName && <span>Ke: {tx.toWalletName}</span>}
                      {tx.savingsName && <span>Tabungan: {tx.savingsName}</span>}
                      {tx.investmentName && <span>Investasi: {tx.investmentName}</span>}
                      <span>{new Date(tx.createdAt).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p
                      className={`text-lg font-bold ${
                        tx.type === 'income' || tx.type === 'savings_withdraw' || tx.type === 'investment_sell'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : tx.type === 'expense' || tx.type === 'savings_deposit' || tx.type === 'investment_buy'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {tx.type === 'income' || tx.type === 'savings_withdraw' || tx.type === 'investment_sell'
                        ? '+'
                        : tx.type === 'expense' || tx.type === 'savings_deposit' || tx.type === 'investment_buy'
                        ? '-'
                        : ''}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm || filter !== 'all' ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
            </p>
          </div>
        )}
      </div>

      {filteredTransactions.length > 0 && (
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
        </div>
      )}
    </div>
  );
}
