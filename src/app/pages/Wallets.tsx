import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Wallet as WalletIcon, Plus, Trash2, Edit2, ArrowRightLeft } from 'lucide-react';

interface Wallet {
  id: string;
  name: string;
  type: string;
  initialBalance: number;
  currentBalance: number;
}

export function Wallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'bank', initialBalance: '' });
  const [transferData, setTransferData] = useState({ fromWalletId: '', toWalletId: '', amount: '', note: '' });

  useEffect(() => {
    loadWallets();
  }, []);

  async function loadWallets() {
    try {
      const data: any = await api.getWallets();
      setWallets(data.wallets);
    } catch (error) {
      console.error('Failed to load wallets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddWallet(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createWallet({
        name: formData.name,
        type: formData.type,
        initialBalance: parseFloat(formData.initialBalance),
      });
      setFormData({ name: '', type: 'bank', initialBalance: '' });
      setShowAddModal(false);
      loadWallets();
    } catch (error: any) {
      alert(error.message || 'Failed to create wallet');
    }
  }

  async function handleDeleteWallet(id: string) {
    if (!confirm('Yakin ingin menghapus dompet ini?')) return;
    try {
      await api.deleteWallet(id);
      loadWallets();
    } catch (error: any) {
      alert(error.message || 'Failed to delete wallet');
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.transferBetweenWallets({
        fromWalletId: transferData.fromWalletId,
        toWalletId: transferData.toWalletId,
        amount: parseFloat(transferData.amount),
        note: transferData.note,
      });
      setTransferData({ fromWalletId: '', toWalletId: '', amount: '', note: '' });
      setShowTransferModal(false);
      loadWallets();
    } catch (error: any) {
      alert(error.message || 'Transfer failed');
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const walletTypes = [
    { value: 'bank', label: 'Rekening Bank' },
    { value: 'digital', label: 'Dompet Digital' },
    { value: 'cash', label: 'Uang Tunai' },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Dompet</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Kelola semua dompet Anda</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowRightLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Transfer</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah Dompet</span>
          </button>
        </div>
      </div>

      {/* Total Balance */}
      <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl p-6 text-white">
        <p className="text-emerald-100 mb-2">Total Saldo Dompet</p>
        <p className="text-4xl font-bold">
          {formatCurrency(wallets.reduce((sum, w) => sum + w.currentBalance, 0))}
        </p>
        <p className="text-emerald-100 mt-2">{wallets.length} Dompet</p>
      </div>

      {/* Wallets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <WalletIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{wallet.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{wallet.type}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteWallet(wallet.id)}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Saldo Saat Ini</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(wallet.currentBalance)}
              </p>
            </div>
          </div>
        ))}

        {wallets.length === 0 && (
          <div className="col-span-full text-center py-12">
            <WalletIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Belum ada dompet. Tambah dompet pertama Anda!</p>
          </div>
        )}
      </div>

      {/* Add Wallet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Tambah Dompet</h2>
            <form onSubmit={handleAddWallet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nama Dompet
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="BCA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Jenis Dompet
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  {walletTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Saldo Awal
                </label>
                <input
                  type="number"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="5000000"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Transfer Antar Dompet</h2>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Dari Dompet
                </label>
                <select
                  value={transferData.fromWalletId}
                  onChange={(e) => setTransferData({ ...transferData, fromWalletId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
                  Ke Dompet
                </label>
                <select
                  value={transferData.toWalletId}
                  onChange={(e) => setTransferData({ ...transferData, toWalletId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Pilih dompet</option>
                  {wallets
                    .filter((w) => w.id !== transferData.fromWalletId)
                    .map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Jumlah
                </label>
                <input
                  type="number"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  value={transferData.note}
                  onChange={(e) => setTransferData({ ...transferData, note: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Catatan transfer"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
