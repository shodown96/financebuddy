"use client"

import { useMemo, useState } from "react"

interface BudgetItem {
    id: string
    name: string
    amount: number
}

export default function BudgetCalculator() {
    const [baseAmount, setBaseAmount] = useState<number>(0)
    const [items, setItems] = useState<BudgetItem[]>([])
    const [name, setName] = useState("")
    const [amount, setAmount] = useState<number | "">("")

    const totalAllocated = useMemo(
        () => items.reduce((sum, item) => sum + item.amount, 0),
        [items]
    )

    const remaining = useMemo(
        () => baseAmount - totalAllocated,
        [baseAmount, totalAllocated]
    )

    const addItem = () => {
        if (!name.trim() || !amount || Number(amount) <= 0) return

        const newItem: BudgetItem = {
            id: crypto.randomUUID(),
            name: name.trim(),
            amount: Number(amount),
        }

        setItems((prev) => [...prev, newItem])
        setName("")
        setAmount("")
    }

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id))
    }

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(value)

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 transition-colors">
            <div className="mx-auto max-w-6xl space-y-6">
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Budget Calculator
                </h1>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                                Monthly Income
                            </h2>
                            <input
                                value={baseAmount}
                                onChange={(e) => {
                                    if (!!Number(e.target.value) || e.target.value === '') {
                                        setBaseAmount(Number(e.target.value))
                                    }
                                }}
                                placeholder="Enter base amount"
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-lg font-medium text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-300"
                            />
                        </div>

                        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-4">
                            <h2 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                Add Budget Item
                            </h2>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Item name (Rent, Food, Savings...)"
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-300"
                            />

                            <input
                                type="number"
                                value={amount}
                                onChange={(e) =>
                                    setAmount(e.target.value ? Number(e.target.value) : "")
                                }
                                placeholder="Amount"
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-300"
                            />

                            <button
                                onClick={addItem}
                                className="w-full rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 py-2 font-medium hover:opacity-90 transition"
                            >
                                Add Item
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-4">
                                Budget Items
                            </h2>

                            {items.length === 0 && (
                                <p className="text-sm text-neutral-400 dark:text-neutral-500">
                                    No items added yet.
                                </p>
                            )}

                            <div className="space-y-3">
                                {items.map((item) => {
                                    const percentage =
                                        baseAmount > 0
                                            ? ((item.amount / baseAmount) * 100).toFixed(1)
                                            : "0"

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-800/50"
                                        >
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                                    {item.name}
                                                </p>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    {percentage}% of income
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <p className="font-medium text-neutral-800 dark:text-neutral-200">
                                                    {formatCurrency(item.amount)}
                                                </p>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-sm text-red-500 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-3">
                            <h2 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                Summary
                            </h2>

                            <div className="flex justify-between">
                                <span className="text-neutral-500 dark:text-neutral-400">
                                    Base Income
                                </span>
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                    {formatCurrency(baseAmount)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-neutral-500 dark:text-neutral-400">
                                    Allocated
                                </span>
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                    {formatCurrency(totalAllocated)}
                                </span>
                            </div>

                            <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
                                <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                                    Remaining
                                </span>
                                <span
                                    className={`font-semibold ${remaining < 0
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-green-600 dark:text-green-400"
                                        }`}
                                >
                                    {formatCurrency(remaining)}
                                </span>
                            </div>

                            {remaining < 0 && (
                                <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                                    You are over budget by{" "}
                                    {formatCurrency(Math.abs(remaining))}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}