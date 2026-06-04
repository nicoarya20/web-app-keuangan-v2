import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5c8e519d`;

class ApiClient {
  private getHeaders(withAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (withAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['Authorization'] = `Bearer ${publicAnonKey}`;
      }
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}, requireAuth = false): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders(requireAuth);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async register(email: string, password: string, name: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me', {}, true);
  }

  // Wallet endpoints
  async getWallets() {
    return this.request('/wallets', {}, true);
  }

  async createWallet(data: { name: string; type: string; initialBalance: number }) {
    return this.request('/wallets', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async updateWallet(id: string, data: { name?: string; type?: string }) {
    return this.request(`/wallets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async deleteWallet(id: string) {
    return this.request(`/wallets/${id}`, {
      method: 'DELETE',
    }, true);
  }

  async transferBetweenWallets(data: { fromWalletId: string; toWalletId: string; amount: number; note?: string }) {
    return this.request('/wallets/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  // Income endpoints
  async getIncome() {
    return this.request('/income', {}, true);
  }

  async createIncome(data: { date: string; amount: number; source: string; category: string; note?: string; walletId: string }) {
    return this.request('/income', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async deleteIncome(id: string) {
    return this.request(`/income/${id}`, {
      method: 'DELETE',
    }, true);
  }

  // Expense endpoints
  async getExpenses() {
    return this.request('/expenses', {}, true);
  }

  async createExpense(data: { date: string; amount: number; category: string; paymentMethod?: string; note?: string; walletId: string }) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async deleteExpense(id: string) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    }, true);
  }

  // Savings endpoints
  async getSavings() {
    return this.request('/savings', {}, true);
  }

  async createSavings(data: { name: string; targetAmount: number; deadline?: string }) {
    return this.request('/savings', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async depositToSavings(id: string, data: { amount: number; walletId: string; note?: string }) {
    return this.request(`/savings/${id}/deposit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async withdrawFromSavings(id: string, data: { amount: number; walletId: string; note?: string }) {
    return this.request(`/savings/${id}/withdraw`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async deleteSavings(id: string) {
    return this.request(`/savings/${id}`, {
      method: 'DELETE',
    }, true);
  }

  // Investment endpoints
  async getInvestments() {
    return this.request('/investments', {}, true);
  }

  async createInvestment(data: { name: string; type: string; initialAmount: number; currentValue?: number; purchaseDate?: string; walletId: string }) {
    return this.request('/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async updateInvestment(id: string, data: { currentValue: number }) {
    return this.request(`/investments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async sellInvestment(id: string, data: { sellAmount: number; walletId: string }) {
    return this.request(`/investments/${id}/sell`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  // Transaction history endpoints
  async getTransactions() {
    return this.request('/transactions', {}, true);
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request('/dashboard/stats', {}, true);
  }
}

export const api = new ApiClient();
