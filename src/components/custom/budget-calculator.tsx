"use client";

import { useMemo, useState } from "react";

interface BudgetItem { id: string; name: string; amount: number }

const INPUT_CLS =
  "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition " +
  "border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 " +
  "focus:ring-2 focus:ring-teal-300/50 focus:border-teal-400 " +
  "dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-50 dark:placeholder:text-stone-500 " +
  "dark:focus:ring-teal-600/40 dark:focus:border-teal-600";

export default function BudgetCalculator() {
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | "">("");

  const totalAllocated = useMemo(() => items.reduce((s, i) => s + i.amount, 0), [items]);
  const remaining = useMemo(() => baseAmount - totalAllocated, [baseAmount, totalAllocated]);

  const addItem = () => {
    if (!name.trim() || !amount || Number(amount) <= 0) return;
    setItems((prev) => [...prev, { id: crypto.randomUUID(), name: name.trim(), amount: Number(amount) }]);
    setName("");
    setAmount("");
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-50">
        Budget Calculator
      </h2>
      <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
        Enter your monthly income, then add spending categories to see how much remains.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {/* Left column */}
        <div className="space-y-5">
          {/* Income */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-700/50 dark:bg-stone-800/50">
            <label className="block text-sm font-semibold text-stone-900 dark:text-stone-50 mb-2">
              Monthly Income
            </label>
            <input
              value={baseAmount || ""}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!isNaN(v) || e.target.value === "") setBaseAmount(Number(e.target.value) || 0);
              }}
              placeholder="Enter base amount"
              inputMode="numeric"
              className={INPUT_CLS + " text-lg font-medium"}
            />
          </div>

          {/* Add item */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3 dark:border-stone-700/50 dark:bg-stone-800/50">
            <div className="text-sm font-semibold text-stone-900 dark:text-stone-50">Add Budget Item</div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name (Rent, Food, Savings…)"
              className={INPUT_CLS}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="Amount"
              className={INPUT_CLS}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <button
              onClick={addItem}
              className="w-full rounded-xl bg-teal-700 text-white py-2.5 text-sm font-semibold hover:bg-teal-800 transition dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              Add Item
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Items list */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-700/50 dark:bg-stone-800/50">
            <div className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-3">Budget Items</div>
            {items.length === 0 ? (
              <p className="text-sm text-stone-400 dark:text-stone-500">No items added yet.</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => {
                  const pct = baseAmount > 0 ? ((item.amount / baseAmount) * 100).toFixed(1) : "0";
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-stone-100 p-3 bg-stone-50 dark:border-stone-700/30 dark:bg-stone-800/30"
                    >
                      <div>
                        <p className="font-medium text-stone-900 dark:text-stone-50 text-sm">{item.name}</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">{pct}% of income</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-stone-900 dark:text-stone-50 text-sm">{fmt(item.amount)}</p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3 dark:border-stone-700/50 dark:bg-stone-800/50">
            <div className="text-sm font-semibold text-stone-900 dark:text-stone-50">Summary</div>
            {[
              { label: "Base Income", value: fmt(baseAmount) },
              { label: "Allocated", value: fmt(totalAllocated) },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-stone-500 dark:text-stone-400">{r.label}</span>
                <span className="font-medium text-stone-900 dark:text-stone-50">{r.value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-stone-100 dark:border-stone-700/30">
              <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Remaining</span>
              <span
                className={`text-sm font-bold ${
                  remaining < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-teal-700 dark:text-teal-400"
                }`}
              >
                {fmt(remaining)}
              </span>
            </div>
            {remaining < 0 && (
              <p className="text-xs text-red-500 dark:text-red-400">
                Over budget by {fmt(Math.abs(remaining))}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
