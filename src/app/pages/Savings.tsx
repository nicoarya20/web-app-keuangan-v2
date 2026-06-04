import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Plus, PiggyBank, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export function Savings() {
  const [savings, setSavings] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedSavings, setSelectedSavings] = useState<any>(null);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
  });
  const [transactionData, setTransactionData] = useState({
    amount: '',
    walletId: '',
    note: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [savingsData, walletsData]: any = await Promise.all([
        api.getSavings(),
        api.getWallets(),
      ]);
      setSavings(savingsData.savings);
      setWallets(walletsData.wallets);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createSavings({
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        deadline: formData.deadline || undefined,
      });
      setFormData({ name: '', targetAmount: '', deadline: '' });
      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to create savings');
    }
  }

  async function handleTransaction(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (transactionType === 'deposit') {
        await api.depositToSavings(selectedSavings.id, {
          amount: parseFloat(transactionData.amount),
          walletId: transactionData.walletId,
          note: transactionData.note,
        });
      } else {
        await api.withdrawFromSavings(selectedSavings.id, {
          amount: parseFloat(transactionData.amount),
          walletId: transactionData.walletId,
          note: transactionData.note,
        });
      }
      setTransactionData({ amount: '', walletId: '', note: '' });
      setShowTransactionModal(false);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Transaction failed');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus tabungan ini?')) return;
    try {
      await api.deleteSavings(id);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete savings');
    }
  }

  function openTransaction(saving: any, type: 'deposit' | 'withdraw') {
    setSelectedSavings(saving);
    setTransactionType(type);
    setShowTransactionModal(true);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Tabungan</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Kelola target tabungan Anda</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Tabungan</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
        <p className="text-purple-100 mb-2">Total Tabungan</p>
        <p className="text-4xl font-bold">
          {formatCurrency(savings.reduce((sum, s) => sum + s.currentAmount, 0))}
        </p>
        <p className="text-purple-100 mt-2">{savings.length} Target Tabungan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savings.map((saving) => {
          const progress = (saving.currentAmount / saving.targetAmount) * 100;
          return (
            <div
              key={saving.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <PiggyBank className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{saving.name}</h3>
                    {saving.deadline && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Deadline: {new Date(saving.deadline).toLocaleDateString('id-ID')}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(saving.id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Progress</span>
                  <span className="font-medium text-slate-900 dark:text-white">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Terkumpul</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {formatCurrency(saving.currentAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Target</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(saving.targetAmount)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openTransaction(saving, 'deposit')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  Setor
                </button>
                <button
                  onClick={() => openTransaction(saving, 'withdraw')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  Tarik
                </button>
              </div>
            </div>
          );
        })}

        {savings.length === 0 && (
          <div className="col-span-full text-center py-12">
            <PiggyBank className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Belum ada tabungan. Buat target tabungan Anda!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Tambah Tabungan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nama Target
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Dana Darurat"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Target Nominal
                </label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="10000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Deadline (Opsional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransactionModal && selectedSavings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {transactionType === 'deposit' ? 'Setor' : 'Tarik'} Tabungan
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {selectedSavings.name} - Saldo: {formatCurrency(selectedSavings.currentAmount)}
            </p>
            <form onSubmit={handleTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jumlah</label>
                <input
                  type="number"
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dompet</label>
                <select
                  value={transactionData.walletId}
                  onChange={(e) => setTransactionData({ ...transactionData, walletId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Pilih dompet</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} - {formatCurrency(wallet.currentBalance)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  value={transactionData.note}
                  onChange={(e) => setTransactionData({ ...transactionData, note: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Catatan"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 text-white rounded-lg ${
                    transactionType === 'deposit'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {transactionType === 'deposit' ? 'Setor' : 'Tarik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
