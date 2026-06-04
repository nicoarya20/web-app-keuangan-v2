import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Plus, TrendingDown, Trash2 } from 'lucide-react';

export function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Makanan',
    paymentMethod: '',
    note: '',
    walletId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [expensesData, walletsData]: any = await Promise.all([
        api.getExpenses(),
        api.getWallets(),
      ]);
      setExpenses(expensesData.expenses);
      setWallets(walletsData.wallets);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createExpense({
        date: formData.date,
        amount: parseFloat(formData.amount),
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        walletId: formData.walletId,
      });
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: 'Makanan',
        paymentMethod: '',
        note: '',
        walletId: '',
      });
      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to create expense');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus pengeluaran ini?')) return;
    try {
      await api.deleteExpense(id);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete expense');
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const categories = ['Makanan', 'Transportasi', 'Belanja', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Pengeluaran</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Kelola semua pengeluaran Anda</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Pengeluaran</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-6 text-white">
        <p className="text-red-100 mb-2">Total Pengeluaran</p>
        <p className="text-4xl font-bold">
          {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
        </p>
        <p className="text-red-100 mt-2">{expenses.length} Transaksi</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Tanggal</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Kategori</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Dompet</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Catatan</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Jumlah</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {expenses.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                    {new Date(item.date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{item.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.walletName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.note || '-'}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-12">
            <TrendingDown className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Belum ada pengeluaran.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Tambah Pengeluaran</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tanggal</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jumlah</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dompet</label>
                <select
                  value={formData.walletId}
                  onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Pilih dompet</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Catatan tambahan"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
