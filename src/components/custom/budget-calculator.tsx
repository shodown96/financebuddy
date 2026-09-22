"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface BudgetItem { id: string; name: string; amount: number }
interface Board { id: string; name: string; baseAmount: number; items: BudgetItem[] }

const STORAGE_KEY = "financebuddy:budget-calculator";

const INPUT_CLS =
  "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition " +
  "border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 " +
  "focus:ring-2 focus:ring-teal-300/50 focus:border-teal-400 " +
  "dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-50 dark:placeholder:text-stone-500 " +
  "dark:focus:ring-teal-600/40 dark:focus:border-teal-600";

const createBoard = (name: string): Board => ({
  id: crypto.randomUUID(),
  name,
  baseAmount: 0,
  items: [],
});

function loadFromStorage(): { boards: Board[]; activeId: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        boards?: Board[];
        activeId?: string;
        baseAmount?: number;
        items?: BudgetItem[];
      };

      if (Array.isArray(parsed.boards) && parsed.boards.length > 0) {
        const activeId =
          parsed.activeId && parsed.boards.some((b) => b.id === parsed.activeId)
            ? parsed.activeId
            : parsed.boards[0].id;
        return { boards: parsed.boards, activeId };
      }

      if (typeof parsed.baseAmount === "number" || Array.isArray(parsed.items)) {
        const migrated = createBoard("Budget 1");
        migrated.baseAmount = parsed.baseAmount ?? 0;
        migrated.items = Array.isArray(parsed.items) ? parsed.items : [];
        return { boards: [migrated], activeId: migrated.id };
      }
    }
  } catch {
    // ignore corrupted storage
  }
  const initial = createBoard("Budget 1");
  return { boards: [initial], activeId: initial.id };
}

export default function BudgetCalculator() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const hasLoaded = useRef(false);

  // Hydrating persisted boards must happen post-mount since localStorage
  // isn't available during SSR; the pre-load render intentionally matches
  // the server output to avoid a hydration mismatch.
  useEffect(() => {
    const { boards: loaded, activeId: loadedActiveId } = loadFromStorage();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBoards(loaded);
    setActiveId(loadedActiveId);
    hasLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ boards, activeId }));
    } catch {
      // ignore write failures (e.g. storage full or disabled)
    }
  }, [boards, activeId]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const activeBoard = boards.find((b) => b.id === activeId);

  const updateBoard = (id: string, patch: Partial<Board>) => {
    setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const addBoard = () => {
    const board = createBoard(`Budget ${boards.length + 1}`);
    setBoards((prev) => [...prev, board]);
    setActiveId(board.id);
    setEditingId(board.id);
  };

  const removeBoard = (id: string) => {
    const board = boards.find((b) => b.id === id);
    if (board && (board.baseAmount > 0 || board.items.length > 0)) {
      if (!window.confirm(`Delete "${board.name}"? This can't be undone.`)) return;
    }
    setBoards((prev) => {
      const next = prev.filter((b) => b.id !== id);
      if (next.length === 0) {
        const fresh = createBoard("Budget 1");
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  if (!activeBoard) return null;

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-50">
        Budget Calculator
      </h2>
      <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
        Split your budget into sections, salary, investments, side income, whatever you track, and
        switch between them.
      </p>

      <BoardTabs
        boards={boards}
        activeId={activeId}
        editingId={editingId}
        onSelect={setActiveId}
        onStartEdit={setEditingId}
        onRename={(id, name) => updateBoard(id, { name })}
        onAdd={addBoard}
        onRemove={removeBoard}
      />

      <BudgetBoardView
        key={activeBoard.id}
        board={activeBoard}
        onChange={(patch) => updateBoard(activeBoard.id, patch)}
      />
    </div>
  );
}

function BoardTabs({
  boards,
  activeId,
  editingId,
  onSelect,
  onStartEdit,
  onRename,
  onAdd,
  onRemove,
}: {
  boards: Board[];
  activeId: string;
  editingId: string | null;
  onSelect: (id: string) => void;
  onStartEdit: (id: string | null) => void;
  onRename: (id: string, name: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const commitEditing = () => {
    const value = inputRef.current?.value.trim();
    if (editingId && value) onRename(editingId, value);
    onStartEdit(null);
  };

  return (
    <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
      {boards.map((board) => {
        const isActive = board.id === activeId;
        return (
          <div
            key={board.id}
            className={`group flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
              isActive
                ? "border-teal-400 bg-teal-50 text-teal-800 dark:border-teal-600 dark:bg-teal-900/30 dark:text-teal-300"
                : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-stone-700/60 dark:bg-stone-800/50 dark:text-stone-400 dark:hover:border-stone-600"
            }`}
          >
            {editingId === board.id ? (
              <input
                key={board.id}
                ref={inputRef}
                autoFocus
                defaultValue={board.name}
                onFocus={(e) => e.target.select()}
                onBlur={commitEditing}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEditing();
                  if (e.key === "Escape") onStartEdit(null);
                }}
                placeholder="Section name"
                className="w-28 bg-transparent outline-none placeholder:text-teal-700/50 dark:placeholder:text-teal-300/50"
              />
            ) : (
              <button onClick={() => onSelect(board.id)}>{board.name}</button>
            )}
            {editingId !== board.id && (
              <button
                onClick={() => onStartEdit(board.id)}
                aria-label={`Rename ${board.name}`}
                className="text-base leading-none text-stone-400 opacity-0 transition hover:text-teal-700 group-hover:opacity-100 dark:text-stone-500 dark:hover:text-teal-400"
              >
                ✎
              </button>
            )}
            {boards.length > 1 && editingId !== board.id && (
              <button
                onClick={() => onRemove(board.id)}
                aria-label={`Delete ${board.name}`}
                className="text-lg leading-none text-stone-400 opacity-0 transition hover:text-red-600 group-hover:opacity-100 dark:text-stone-500 dark:hover:text-red-400"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
      <button
        onClick={onAdd}
        className="shrink-0 rounded-xl border border-dashed border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-500 hover:border-teal-400 hover:text-teal-700 dark:border-stone-600 dark:text-stone-400 dark:hover:border-teal-600 dark:hover:text-teal-400"
      >
        + Add section
      </button>
    </div>
  );
}

function BudgetBoardView({
  board,
  onChange,
}: {
  board: Board;
  onChange: (patch: Partial<Board>) => void;
}) {
  const { baseAmount, items } = board;
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | "">("");

  const totalAllocated = useMemo(() => items.reduce((s, i) => s + i.amount, 0), [items]);
  const remaining = useMemo(() => baseAmount - totalAllocated, [baseAmount, totalAllocated]);

  const addItem = () => {
    if (!name.trim() || !amount || Number(amount) <= 0) return;
    onChange({ items: [...items, { id: crypto.randomUUID(), name: name.trim(), amount: Number(amount) }] });
    setName("");
    setAmount("");
  };

  const removeItem = (id: string) => onChange({ items: items.filter((i) => i.id !== id) });

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);

  return (
    <div className="mt-5 grid gap-5 md:grid-cols-2">
      {/* Left column */}
      <div className="space-y-5">
        {/* Income */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-700/50 dark:bg-stone-800/50">
          <label className="block text-sm font-semibold text-stone-900 dark:text-stone-50 mb-2">
            Amount
          </label>
          <input
            value={baseAmount || ""}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v) || e.target.value === "") onChange({ baseAmount: Number(e.target.value) || 0 });
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
                      <p className="text-xs text-stone-400 dark:text-stone-500">{pct}% of amount</p>
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
            { label: "Base Amount", value: fmt(baseAmount) },
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
                remaining < 0 ? "text-red-600 dark:text-red-400" : "text-teal-700 dark:text-teal-400"
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
  );
}
