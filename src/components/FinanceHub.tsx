import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, Plus, Trash2, ShieldCheck, PieChart, Wallet, CreditCard } from "lucide-react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  title: string;
  amount: number;
  category: string;
  date: string;
}

interface FinanceHubProps {
  onGainXP: (amount: number, message: string) => void;
}

export default function FinanceHub({ onGainXP }: FinanceHubProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "t1", type: "income", title: "Freelance Script Sync", amount: 1500, category: "Development", date: "24 Jun" },
    { id: "t2", type: "expense", title: "Cloud Run Container Nodes", amount: 45, category: "Server Infrastructure", date: "23 Jun" },
    { id: "t3", type: "expense", title: "Premium Gym Supplements", amount: 120, category: "Health & Physical", date: "20 Jun" },
    { id: "t4", type: "income", title: "Weekly System Core Allowance", amount: 350, category: "Stipend", date: "18 Jun" }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [newCategory, setNewCategory] = useState("Sovereign Cost");

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount.trim() || isNaN(Number(newAmount))) return;
    
    const amt = Number(newAmount);
    const newTx: Transaction = {
      id: `t-${Date.now()}`,
      type: newType,
      title: newTitle,
      amount: amt,
      category: newCategory,
      date: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short" })
    };

    setTransactions([newTx, ...transactions]);
    setNewTitle("");
    setNewAmount("");
    onGainXP(15, `Budget ledger sync active: recorded ${newType}! Finance +15 XP`);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Financial calculations
  const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* COLUMN 1: INTERACTIVE STATS & SUMMARY (4 cols) */}
      <div className="xl:col-span-4 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400">
            <Wallet className="w-5 h-5 animate-pulse" />
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider">Sovereign Wallet</h3>
          </div>
          <p className="text-xs text-slate-400">Monitor budget structures and active fiscal savings goals.</p>
        </div>

        {/* Total Ledger Cards */}
        <div className="space-y-3.5">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-900/60 text-center">
            <div className="text-[10px] font-mono text-slate-500 uppercase">NET CORES SAVED</div>
            <div className="text-2xl font-black font-mono text-blue-400 mt-1">${netSavings.toLocaleString()}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-950/10 border border-emerald-900/20 p-3.5 rounded-xl text-center">
              <span className="text-[9px] font-mono text-emerald-400/80 block uppercase">INCOME</span>
              <span className="text-sm font-bold font-mono text-emerald-400 mt-1">${totalIncome.toLocaleString()}</span>
            </div>
            <div className="bg-rose-950/10 border border-rose-900/20 p-3.5 rounded-xl text-center">
              <span className="text-[9px] font-mono text-rose-400/80 block uppercase">EXPENSES</span>
              <span className="text-sm font-bold font-mono text-rose-400 mt-1">${totalExpense.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Savings Goal Progress */}
        <div className="space-y-2 pt-4 border-t border-slate-900/60">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>SAVINGS GOAL: Peak PC Rig</span>
            <span className="text-blue-400 font-bold">54% Completed</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-900">
            <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: "54%" }} />
          </div>
        </div>
      </div>

      {/* COLUMN 2: TRANSACTION INJECTION & LOGS (8 cols) */}
      <div className="xl:col-span-8 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold font-mono tracking-wider text-blue-400 uppercase">Transaction Logs</h3>
          <CreditCard className="w-4 h-4 text-blue-400" />
        </div>

        {/* Transaction Adding form */}
        <form onSubmit={handleAddTransaction} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-900/60 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input 
              type="text" 
              placeholder="Source or Charge Title" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
            <input 
              type="text" 
              placeholder="Amount in USD" 
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
            <select 
              value={newType}
              onChange={(e: any) => setNewType(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="expense">Expense (-)</option>
              <option value="income">Income (+)</option>
            </select>
            <input 
              type="text" 
              placeholder="Category (e.g. Server)" 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-950/80 hover:bg-blue-900 border border-blue-500/20 text-blue-400 text-xs py-2 rounded-xl font-mono uppercase font-bold tracking-wider transition-all"
          >
            Inject Transaction Ledger
          </button>
        </form>

        {/* Logs Table / List */}
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {transactions.map((tx) => (
            <div 
              key={tx.id}
              className="p-3 bg-slate-950/30 border border-slate-900 rounded-2xl flex items-center justify-between hover:border-slate-800 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                  tx.type === "income" ? "bg-emerald-950/30 text-emerald-400" : "bg-rose-950/30 text-rose-400"
                }`}>
                  {tx.type === "income" ? "+" : "-"}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">{tx.title}</h4>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">{tx.category} • {tx.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold ${
                  tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {tx.type === "income" ? "+" : "-"}${tx.amount}
                </span>
                <button 
                  onClick={() => handleDeleteTransaction(tx.id)}
                  className="p-1 rounded text-slate-600 hover:text-rose-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
