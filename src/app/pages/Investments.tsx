import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Plus, TrendingUpIcon, Trash2, DollarSign } from 'lucide-react';

export function Investments() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Saham',
    initialAmount: '',
    currentValue: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    walletId: '',
  });
  const [sellData, setSellData] = useState({
    sellAmount: '',
    walletId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [investmentsData, walletsData]: any = await Promise.all([
        api.getInvestments(),
        api.getWallets(),
      ]);
      setInvestments(investmentsData.investments);
      setWallets(walletsData.wallets);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createInvestment({
        name: formData.name,
        type: formData.type,
        initialAmount: parseFloat(formData.initialAmount),
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
        purchaseDate: formData.purchaseDate,
        walletId: formData.walletId,
      });
      setFormData({
        name: '',
        type: 'Saham',
        initialAmount: '',
        currentValue: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        walletId: '',
      });
      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to create investment');
    }
  }

  async function handleSell(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.sellInvestment(selectedInvestment.id, {
        sellAmount: parseFloat(sellData.sellAmount),
        walletId: sellData.walletId,
      });
      setSellData({ sellAmount: '', walletId: '' });
      setShowSellModal(false);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to sell investment');
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const types = ['Saham', 'Reksa Dana', 'Emas', 'Crypto', 'Deposito', 'Lainnya'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Investasi</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Kelola portofolio investasi Anda</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Investasi</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white">
        <p className="text-amber-100 mb-2">Total Nilai Investasi</p>
        <p className="text-4xl font-bold">
          {formatCurrency(investments.reduce((sum, i) => sum + i.currentValue, 0))}
        </p>
        <p className="text-amber-100 mt-2">{investments.length} Investasi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {investments.map((investment) => {
          const profit = investment.currentValue - investment.initialAmount;
          const profitPercent = (profit / investment.initialAmount) * 100;
          return (
            <div
              key={investment.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUpIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{investment.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{investment.type}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Modal Awal</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(investment.initialAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Nilai Saat Ini</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {formatCurrency(investment.currentValue)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Keuntungan/Rugi</span>
                  <span
                    className={`font-semibold ${
                      profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {profit >= 0 ? '+' : ''}
                    {formatCurrency(profit)} ({profitPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Tanggal Beli</span>
                  <span className="text-slate-900 dark:text-white">
                    {new Date(investment.purchaseDate).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedInvestment(investment);
                  setSellData({ ...sellData, sellAmount: investment.currentValue.toString() });
                  setShowSellModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                Jual Investasi
              </button>
            </div>
          );
        })}

        {investments.length === 0 && (
          <div className="col-span-full text-center py-12">
            <TrendingUpIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Belum ada investasi. Mulai investasi Anda!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Tambah Investasi</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nama Investasi
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="BBRI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jenis</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Modal Awal
                </label>
                <input
                  type="number"
                  value={formData.initialAmount}
                  onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="1000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nilai Saat Ini (Opsional)
                </label>
                <input
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="1000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tanggal Pembelian
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dompet</label>
                <select
                  value={formData.walletId}
                  onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Pilih dompet</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} - {formatCurrency(wallet.currentBalance)}
                    </option>
                  ))}
                </select>
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
                  className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSellModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Jual Investasi</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {selectedInvestment.name} - {selectedInvestment.type}
            </p>
            <form onSubmit={handleSell} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Harga Jual
                </label>
                <input
                  type="number"
                  value={sellData.sellAmount}
                  onChange={(e) => setSellData({ ...sellData, sellAmount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="1000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Dompet Tujuan
                </label>
                <select
                  value={sellData.walletId}
                  onChange={(e) => setSellData({ ...sellData, walletId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Pilih dompet</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSellModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Jual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
