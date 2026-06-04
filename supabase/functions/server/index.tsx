import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { hash, compare } from "npm:bcryptjs@2.4.3";
import { create as createJWT, verify as verifyJWT } from "npm:djwt@3.0.2";

const app = new Hono();

// JWT Secret Key
const JWT_SECRET = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-256" },
  true,
  ["sign", "verify"]
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify JWT token
async function verifyToken(token: string) {
  try {
    const payload = await verifyJWT(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.log("JWT verification error:", error);
    return null;
  }
}

// Helper function to get authenticated user
async function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;

  return { userId: payload.userId as string, email: payload.email as string };
}

// Generate unique ID
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Health check endpoint
app.get("/make-server-5c8e519d/health", (c) => {
  return c.json({ status: "ok" });
});

// ============= AUTH ROUTES =============

// Register new user
app.post("/make-server-5c8e519d/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    // Check if user exists
    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const userId = generateId();
    const user = {
      id: userId,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${email}`, user);
    await kv.set(`userId:${userId}`, email);

    // Create JWT token
    const token = await createJWT(
      { alg: "HS256", typ: "JWT" },
      { userId, email, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) }, // 7 days
      JWT_SECRET
    );

    return c.json({
      token,
      user: { id: userId, email, name },
    });
  } catch (error) {
    console.log("Registration error:", error);
    return c.json({ error: "Registration failed" }, 500);
  }
});

// Login
app.post("/make-server-5c8e519d/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Get user
    const user = await kv.get(`user:${email}`);
    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Verify password
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Create JWT token
    const token = await createJWT(
      { alg: "HS256", typ: "JWT" },
      { userId: user.id, email, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) },
      JWT_SECRET
    );

    return c.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.log("Login error:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Get current user
app.get("/make-server-5c8e519d/auth/me", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const user = await kv.get(`user:${authUser.email}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.log("Get user error:", error);
    return c.json({ error: "Failed to get user" }, 500);
  }
});

// ============= WALLET ROUTES =============

// Get all wallets for user
app.get("/make-server-5c8e519d/wallets", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const wallets = await kv.getByPrefix(`wallet:${authUser.userId}:`);
    return c.json({ wallets: wallets || [] });
  } catch (error) {
    console.log("Get wallets error:", error);
    return c.json({ error: "Failed to get wallets" }, 500);
  }
});

// Create wallet
app.post("/make-server-5c8e519d/wallets", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { name, type, initialBalance } = body;

    if (!name || !type || initialBalance === undefined) {
      return c.json({ error: "Name, type, and initial balance are required" }, 400);
    }

    const walletId = generateId();
    const wallet = {
      id: walletId,
      userId: authUser.userId,
      name,
      type,
      initialBalance: parseFloat(initialBalance),
      currentBalance: parseFloat(initialBalance),
      createdAt: new Date().toISOString(),
    };

    await kv.set(`wallet:${authUser.userId}:${walletId}`, wallet);

    // Create transaction history for initial balance
    if (parseFloat(initialBalance) > 0) {
      const txId = generateId();
      const transaction = {
        id: txId,
        userId: authUser.userId,
        type: "initial_balance",
        amount: parseFloat(initialBalance),
        walletId,
        walletName: name,
        description: `Initial balance for ${name}`,
        createdAt: new Date().toISOString(),
      };
      await kv.set(`transaction:${authUser.userId}:${txId}`, transaction);
    }

    return c.json({ wallet });
  } catch (error) {
    console.log("Create wallet error:", error);
    return c.json({ error: "Failed to create wallet" }, 500);
  }
});

// Update wallet
app.put("/make-server-5c8e519d/wallets/:id", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const walletId = c.req.param("id");
    const wallet = await kv.get(`wallet:${authUser.userId}:${walletId}`);

    if (!wallet) {
      return c.json({ error: "Wallet not found" }, 404);
    }

    const body = await c.req.json();
    const updatedWallet = {
      ...wallet,
      name: body.name || wallet.name,
      type: body.type || wallet.type,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`wallet:${authUser.userId}:${walletId}`, updatedWallet);
    return c.json({ wallet: updatedWallet });
  } catch (error) {
    console.log("Update wallet error:", error);
    return c.json({ error: "Failed to update wallet" }, 500);
  }
});

// Delete wallet
app.delete("/make-server-5c8e519d/wallets/:id", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const walletId = c.req.param("id");
    await kv.del(`wallet:${authUser.userId}:${walletId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log("Delete wallet error:", error);
    return c.json({ error: "Failed to delete wallet" }, 500);
  }
});

// Transfer between wallets
app.post("/make-server-5c8e519d/wallets/transfer", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { fromWalletId, toWalletId, amount, note } = body;

    if (!fromWalletId || !toWalletId || !amount) {
      return c.json({ error: "From wallet, to wallet, and amount are required" }, 400);
    }

    const fromWallet = await kv.get(`wallet:${authUser.userId}:${fromWalletId}`);
    const toWallet = await kv.get(`wallet:${authUser.userId}:${toWalletId}`);

    if (!fromWallet || !toWallet) {
      return c.json({ error: "Wallet not found" }, 404);
    }

    const transferAmount = parseFloat(amount);
    if (fromWallet.currentBalance < transferAmount) {
      return c.json({ error: "Insufficient balance" }, 400);
    }

    // Update balances
    fromWallet.currentBalance -= transferAmount;
    toWallet.currentBalance += transferAmount;

    await kv.set(`wallet:${authUser.userId}:${fromWalletId}`, fromWallet);
    await kv.set(`wallet:${authUser.userId}:${toWalletId}`, toWallet);

    // Create transaction history
    const txId = generateId();
    const transaction = {
      id: txId,
      userId: authUser.userId,
      type: "transfer",
      amount: transferAmount,
      fromWalletId,
      fromWalletName: fromWallet.name,
      toWalletId,
      toWalletName: toWallet.name,
      description: note || `Transfer from ${fromWallet.name} to ${toWallet.name}`,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`transaction:${authUser.userId}:${txId}`, transaction);

    return c.json({ success: true, fromWallet, toWallet });
  } catch (error) {
    console.log("Transfer error:", error);
    return c.json({ error: "Failed to transfer" }, 500);
  }
});

// ============= INCOME ROUTES =============

// Get all income
app.get("/make-server-5c8e519d/income", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const income = await kv.getByPrefix(`income:${authUser.userId}:`);
    return c.json({ income: income || [] });
  } catch (error) {
    console.log("Get income error:", error);
    return c.json({ error: "Failed to get income" }, 500);
  }
});

// Create income
app.post("/make-server-5c8e519d/income", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { date, amount, source, category, note, walletId } = body;

    if (!date || !amount || !source || !category || !walletId) {
      return c.json({ error: "Date, amount, source, category, and wallet are required" }, 400);
    }

    // Get wallet and update balance
    const wallet = await kv.get(`wallet:${authUser.userId}:${walletId}`);
    if (!wallet) {
      return c.json({ error: "Wallet not found" }, 404);
    }

    wallet.currentBalance += parseFloat(amount);
    await kv.set(`wallet:${authUser.userId}:${walletId}`, wallet);

    // Create income record
    const incomeId = generateId();
    const incomeRecord = {
      id: incomeId,
      userId: authUser.userId,
      date,
      amount: parseFloat(amount),
      source,
      category,
      note: note || "",
      walletId,
      walletName: wallet.name,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`income:${authUser.userId}:${incomeId}`, incomeRecord);

    // Create transaction history
    const txId = generateId();
    const transaction = {
      id: txId,
      userId: authUser.userId,
      type: "income",
      amount: parseFloat(amount),
      walletId,
      walletName: wallet.name,
      category,
      description: `${source} - ${category}${note ? ': ' + note : ''}`,
      createdAt: new Date().toISOString(),
      date,
    };
    await kv.set(`transaction:${authUser.userId}:${txId}`, transaction);

    return c.json({ income: incomeRecord, wallet });
  } catch (error) {
    console.log("Create income error:", error);
    return c.json({ error: "Failed to create income" }, 500);
  }
});

// Delete income
app.delete("/make-server-5c8e519d/income/:id", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const incomeId = c.req.param("id");
    const income = await kv.get(`income:${authUser.userId}:${incomeId}`);

    if (!income) {
      return c.json({ error: "Income not found" }, 404);
    }

    // Update wallet balance
    const wallet = await kv.get(`wallet:${authUser.userId}:${income.walletId}`);
    if (wallet) {
      wallet.currentBalance -= income.amount;
      await kv.set(`wallet:${authUser.userId}:${income.walletId}`, wallet);
    }

    await kv.del(`income:${authUser.userId}:${incomeId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Delete income error:", error);
    return c.json({ error: "Failed to delete income" }, 500);
  }
});

// ============= EXPENSE ROUTES =============

// Get all expenses
app.get("/make-server-5c8e519d/expenses", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const expenses = await kv.getByPrefix(`expense:${authUser.userId}:`);
    return c.json({ expenses: expenses || [] });
  } catch (error) {
    console.log("Get expenses error:", error);
    return c.json({ error: "Failed to get expenses" }, 500);
  }
});

// Create expense
app.post("/make-server-5c8e519d/expenses", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { date, amount, category, paymentMethod, note, walletId } = body;

    if (!date || !amount || !category || !walletId) {
      return c.json({ error: "Date, amount, category, and wallet are required" }, 400);
    }

    // Get wallet and update balance
    const wallet = await kv.get(`wallet:${authUser.userId}:${walletId}`);
    if (!wallet) {
      return c.json({ error: "Wallet not found" }, 404);
    }

    const expenseAmount = parseFloat(amount);
    if (wallet.currentBalance < expenseAmount) {
      return c.json({ error: "Insufficient balance" }, 400);
    }

    wallet.currentBalance -= expenseAmount;
    await kv.set(`wallet:${authUser.userId}:${walletId}`, wallet);

    // Create expense record
    const expenseId = generateId();
    const expenseRecord = {
      id: expenseId,
      userId: authUser.userId,
      date,
      amount: expenseAmount,
      category,
      paymentMethod: paymentMethod || wallet.name,
      note: note || "",
      walletId,
      walletName: wallet.name,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`expense:${authUser.userId}:${expenseId}`, expenseRecord);

    // Create transaction history
    const txId = generateId();
    const transaction = {
      id: txId,
      userId: authUser.userId,
      type: "expense",
      amount: expenseAmount,
      walletId,
      walletName: wallet.name,
      category,
      description: `${category}${note ? ': ' + note : ''}`,
      createdAt: new Date().toISOString(),
      date,
    };
    await kv.set(`transaction:${authUser.userId}:${txId}`, transaction);

    return c.json({ expense: expenseRecord, wallet });
  } catch (error) {
    console.log("Create expense error:", error);
    return c.json({ error: "Failed to create expense" }, 500);
  }
});

// Delete expense
app.delete("/make-server-5c8e519d/expenses/:id", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const expenseId = c.req.param("id");
    const expense = await kv.get(`expense:${authUser.userId}:${expenseId}`);

    if (!expense) {
      return c.json({ error: "Expense not found" }, 404);
    }

    // Update wallet balance
    const wallet = await kv.get(`wallet:${authUser.userId}:${expense.walletId}`);
    if (wallet) {
      wallet.currentBalance += expense.amount;
      await kv.set(`wallet:${authUser.userId}:${expense.walletId}`, wallet);
    }

    await kv.del(`expense:${authUser.userId}:${expenseId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Delete expense error:", error);
    return c.json({ error: "Failed to delete expense" }, 500);
  }
});

// ============= SAVINGS ROUTES =============

// Get all savings
app.get("/make-server-5c8e519d/savings", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const savings = await kv.getByPrefix(`savings:${authUser.userId}:`);
    return c.json({ savings: savings || [] });
  } catch (error) {
    console.log("Get savings error:", error);
    return c.json({ error: "Failed to get savings" }, 500);
  }
});

// Create savings goal
app.post("/make-server-5c8e519d/savings", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { name, targetAmount, deadline } = body;

    if (!name || !targetAmount) {
      return c.json({ error: "Name and target amount are required" }, 400);
    }

    const savingsId = generateId();
    const savings = {
      id: savingsId,
      userId: authUser.userId,
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      deadline: deadline || null,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`savings:${authUser.userId}:${savingsId}`, savings);
    return c.json({ savings });
  } catch (error) {
    console.log("Create savings error:", error);
    return c.json({ error: "Failed to create savings" }, 500);
  }
});

// Deposit to savings
app.post("/make-server-5c8e519d/savings/:id/deposit", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const savingsId = c.req.param("id");
    const body = await c.req.json();
    const { amount, walletId, note } = body;

    if (!amount || !walletId) {
      return c.json({ error: "Amount and wallet are required" }, 400);
    }

    const savings = await kv.get(`savings:${authUser.userId}:${savingsId}`);
    const wallet = await kv.get(`wallet:${authUser.userId}:${walletId}`);

    if (!savings || !wallet) {
      return c.json({ error: "Savings or wallet not found" }, 404);
    }

    const depositAmount = parseFloat(amount);
    if (wallet.currentBalance < depositAmount) {
      return c.json({ error: "Insufficient balance" }, 400);
    }

    // Update balances
    wallet.currentBalance -= depositAmount;
    savings.currentAmount += depositAmount;

    await kv.set(`wallet:${authUser.userId}:${walletId}`, wallet);
    await kv.set(`savings:${authUser.userId}:${savingsId}`, savings);

    // Create transaction history
    const txId = generateId();
    const transaction = {
      id: txId,
      userId: authUser.userId,
      type: "savings_deposit",
      amount: depositAmount,
      walletId,
      walletName: wallet.name,
      savingsId,
      savingsName: savings.name,
      description: `Deposit to ${savings.name}${note ? ': ' + note : ''}`,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`transaction:${authUser.userId}:${txId}`, transaction);

    return c.json({ savings, wallet });
  } catch (error) {
    console.log("Deposit to savings error:", error);
    return c.json({ error: "Failed to deposit to savings" }, 500);
  }
});

// Withdraw from savings
app.post("/make-server-5c8e519d/savings/:id/withdraw", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const savingsId = c.req.param("id");
    const body = await c.req.json();
    const { amount, walletId, note } = body;

    if (!amount || !walletId) {
      return c.json({ error: "Amount and wallet are required" }, 400);
    }

    const savings = await kv.get(`savings:${authUser.userId}:${savingsId}`);
    const wallet = await kv.get(`wallet:${authUser.userId}:${walletId}`);

    if (!savings || !wallet) {
      return c.json({ error: "Savings or wallet not found" }, 404);
    }

    const withdrawAmount = parseFloat(amount);
    if (savings.currentAmount < withdrawAmount) {
      return c.json({ error: "Insufficient savings balance" }, 400);
    }

    // Update balances
    savings.currentAmount -= withdrawAmount;
    wallet.currentBalance += withdrawAmount;

    await kv.set(`savings:${authUser.userId}:${savingsId}`, savings);
    await kv.set(`wallet:${authUser.userId}:${walletId}`, wallet);

    // Create transaction history
    const txId = generateId();
    const transaction = {
      id: txId,
      userId: authUser.userId,
      type: "savings_withdraw",
      amount: withdrawAmount,
      walletId,
      walletName: wallet.name,
      savingsId,
      savingsName: savings.name,
      description: `Withdraw from ${savings.name}${note ? ': ' + note : ''}`,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`transaction:${authUser.userId}:${txId}`, transaction);

    return c.json({ savings, wallet });
  } catch (error) {
    console.log("Withdraw from savings error:", error);
    return c.json({ error: "Failed to withdraw from savings" }, 500);
  }
});

// Delete savings
app.delete("/make-server-5c8e519d/savings/:id", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const savingsId = c.req.param("id");
    const savings = await kv.get(`savings:${authUser.userId}:${savingsId}`);

    if (!savings) {
      return c.json({ error: "Savings not found" }, 404);
    }

    if (savings.currentAmount > 0) {
      return c.json({ error: "Cannot delete savings with balance. Withdraw funds first." }, 400);
    }

    await kv.del(`savings:${authUser.userId}:${savingsId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Delete savings error:", error);
    return c.json({ error: "Failed to delete savings" }, 500);
  }
});

// ============= INVESTMENT ROUTES =============

// Get all investments
app.get("/make-server-5c8e519d/investments", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const investments = await kv.getByPrefix(`investment:${authUser.userId}:`);
    return c.json({ investments: investments || [] });
  } catch (error) {
    console.log("Get investments error:", error);
    return c.json({ error: "Failed to get investments" }, 500);
  }
});

// Create investment
app.post("/make-server-5c8e519d/investments", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { name, type, initialAmount, currentValue, purchaseDate, walletId } = body;

    if (!name || !type || !initialAmount || !walletId) {
      return c.json({ error: "Name, type, initial amount, and wallet are required" }, 400);
    }

    // Get wallet and update balance
    const wallet = await kv.get(`wallet:${authUser.userId}:${walletId}`);
    if (!wallet) {
      return c.json({ error: "Wallet not found" }, 404);
    }

    const investAmount = parseFloat(initialAmount);
    if (wallet.currentBalance < investAmount) {
      return c.json({ error: "Insufficient balance" }, 400);
    }

    wallet.currentBalance -= investAmount;
    await kv.set(`wallet:${authUser.userId}:${walletId}`, wallet);

    // Create investment record
    const investmentId = generateId();
    const investment = {
      id: investmentId,
      userId: authUser.userId,
      name,
      type,
      initialAmount: investAmount,
      currentValue: currentValue ? parseFloat(currentValue) : investAmount,
      purchaseDate: purchaseDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await kv.set(`investment:${authUser.userId}:${investmentId}`, investment);

    // Create transaction history
    const txId = generateId();
    const transaction = {
      id: txId,
      userId: authUser.userId,
      type: "investment_buy",
      amount: investAmount,
      walletId,
      walletName: wallet.name,
      investmentId,
      investmentName: name,
      description: `Buy ${type}: ${name}`,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`transaction:${authUser.userId}:${txId}`, transaction);

    return c.json({ investment, wallet });
  } catch (error) {
    console.log("Create investment error:", error);
    return c.json({ error: "Failed to create investment" }, 500);
  }
});

// Update investment value
app.put("/make-server-5c8e519d/investments/:id", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const investmentId = c.req.param("id");
    const investment = await kv.get(`investment:${authUser.userId}:${investmentId}`);

    if (!investment) {
      return c.json({ error: "Investment not found" }, 404);
    }

    const body = await c.req.json();
    const updatedInvestment = {
      ...investment,
      currentValue: body.currentValue ? parseFloat(body.currentValue) : investment.currentValue,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`investment:${authUser.userId}:${investmentId}`, updatedInvestment);
    return c.json({ investment: updatedInvestment });
  } catch (error) {
    console.log("Update investment error:", error);
    return c.json({ error: "Failed to update investment" }, 500);
  }
});

// Sell investment
app.post("/make-server-5c8e519d/investments/:id/sell", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const investmentId = c.req.param("id");
    const body = await c.req.json();
    const { sellAmount, walletId } = body;

    if (!sellAmount || !walletId) {
      return c.json({ error: "Sell amount and wallet are required" }, 400);
    }

    const investment = await kv.get(`investment:${authUser.userId}:${investmentId}`);
    const wallet = await kv.get(`wallet:${authUser.userId}:${walletId}`);

    if (!investment || !wallet) {
      return c.json({ error: "Investment or wallet not found" }, 404);
    }

    const sellValue = parseFloat(sellAmount);
    wallet.currentBalance += sellValue;
    await kv.set(`wallet:${authUser.userId}:${walletId}`, wallet);

    // Delete investment
    await kv.del(`investment:${authUser.userId}:${investmentId}`);

    // Create transaction history
    const txId = generateId();
    const transaction = {
      id: txId,
      userId: authUser.userId,
      type: "investment_sell",
      amount: sellValue,
      walletId,
      walletName: wallet.name,
      investmentId,
      investmentName: investment.name,
      description: `Sell ${investment.type}: ${investment.name}`,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`transaction:${authUser.userId}:${txId}`, transaction);

    return c.json({ wallet, profit: sellValue - investment.initialAmount });
  } catch (error) {
    console.log("Sell investment error:", error);
    return c.json({ error: "Failed to sell investment" }, 500);
  }
});

// ============= TRANSACTION HISTORY ROUTES =============

// Get transaction history
app.get("/make-server-5c8e519d/transactions", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const transactions = await kv.getByPrefix(`transaction:${authUser.userId}:`);

    // Sort by createdAt descending
    const sortedTransactions = (transactions || []).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ transactions: sortedTransactions });
  } catch (error) {
    console.log("Get transactions error:", error);
    return c.json({ error: "Failed to get transactions" }, 500);
  }
});

// ============= DASHBOARD STATS ROUTES =============

// Get dashboard statistics
app.get("/make-server-5c8e519d/dashboard/stats", async (c) => {
  try {
    const authUser = await getAuthUser(c.req.raw);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get all data
    const wallets = await kv.getByPrefix(`wallet:${authUser.userId}:`) || [];
    const income = await kv.getByPrefix(`income:${authUser.userId}:`) || [];
    const expenses = await kv.getByPrefix(`expense:${authUser.userId}:`) || [];
    const savings = await kv.getByPrefix(`savings:${authUser.userId}:`) || [];
    const investments = await kv.getByPrefix(`investment:${authUser.userId}:`) || [];

    // Calculate totals
    const totalWalletBalance = wallets.reduce((sum, w) => sum + w.currentBalance, 0);
    const totalSavings = savings.reduce((sum, s) => sum + s.currentAmount, 0);
    const totalInvestments = investments.reduce((sum, i) => sum + i.currentValue, 0);

    // Current month calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyIncome = income
      .filter(i => {
        const date = new Date(i.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, i) => sum + i.amount, 0);

    const monthlyExpenses = expenses
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const cashFlow = monthlyIncome - monthlyExpenses;
    const netWorth = totalWalletBalance + totalSavings + totalInvestments;

    // Top expense categories
    const categoryTotals = {};
    expenses
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });

    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return c.json({
      totalWalletBalance,
      monthlyIncome,
      monthlyExpenses,
      totalSavings,
      totalInvestments,
      cashFlow,
      netWorth,
      topCategories,
      walletsCount: wallets.length,
      savingsGoals: savings.length,
      investmentsCount: investments.length,
    });
  } catch (error) {
    console.log("Get dashboard stats error:", error);
    return c.json({ error: "Failed to get dashboard stats" }, 500);
  }
});

Deno.serve(app.fetch);
