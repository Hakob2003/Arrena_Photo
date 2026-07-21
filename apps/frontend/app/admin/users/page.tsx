"use client";
import React, { useEffect, useState } from "react";
import { adminApi } from "../../../lib/admin.api";
import { PageHeader } from "../../../components/admin/PageHeader";
import { BentoCard } from "../../../components/admin/BentoCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ConfirmDeleteModal } from "../../../components/ui/ConfirmDeleteModal";
import {
  Users,
  Search,
  Filter,
  Shield,
  Settings,
  Battery,
  Ban,
} from "lucide-react";

type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string | null;
  status: string;
  credits: number;
  role: { name: string };
  plan: string;
  generationCount: number;
  maxConcurrentOverride?: number | null;
  queueDelayOverride?: number | null;
  priorityOverride?: number | null;
};

const columnHelper = createColumnHelper<User>();

export default function AdminUsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [editingCredits, setEditingCredits] = useState<User | null>(null);
  const [changingPlan, setChangingPlan] = useState<User | null>(null);
  const [editingLimits, setEditingLimits] = useState<User | null>(null);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState("");
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers(page, 20, search, roleFilter);
      setData(res.users);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleAddCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCredits) return;
    const form = e.target as HTMLFormElement;
    const amount = Number(form.amount.value);
    const reason = form.reason.value;

    try {
      await adminApi.updateUserCredits(editingCredits.id, amount, reason);
      setEditingCredits(null);
      loadData();
    } catch (err) {
      alert("Error adding credits");
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    const emails = importText
      .split("\n")
      .map((line) => line.split(",")[0].trim())
      .filter((e) => e);
    try {
      const res = await adminApi.importUsers(emails);
      alert(`Successfully imported ${res.importedCount} users.`);
      setImporting(false);
      setImportText("");
      loadData();
    } catch (err) {
      alert("Error importing users");
    }
  };

  const handleChangePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changingPlan) return;
    const form = e.target as HTMLFormElement;
    const plan = form.plan.value;

    try {
      await adminApi.updateUserPlan(changingPlan.id, plan);
      setChangingPlan(null);
      loadData();
    } catch (err) {
      alert("Error changing plan");
    }
  };

  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLimits) return;
    const form = e.target as HTMLFormElement;
    const maxConcurrentOverride = form.maxConcurrentOverride.value
      ? Number(form.maxConcurrentOverride.value)
      : null;
    const queueDelayOverride = form.queueDelayOverride.value
      ? Number(form.queueDelayOverride.value)
      : null;
    const priorityOverride = form.priorityOverride.value
      ? Number(form.priorityOverride.value)
      : null;

    try {
      await adminApi.updateUserLimits(editingLimits.id, {
        maxConcurrentOverride,
        queueDelayOverride,
        priorityOverride,
      });
      setEditingLimits(null);
      loadData();
    } catch (err) {
      alert("Error updating limits");
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeletingUser(true);
      await adminApi.deleteUser(userToDelete.id);
      loadData();
    } catch (e) {
      alert("Error deleting user");
    } finally {
      setDeletingUser(false);
      setUserToDelete(null);
    }
  };

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <span className="text-white/40 font-mono text-xs">
          {info.getValue().slice(0, 8)}...
        </span>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => (
        <span className="text-white font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Registered / Last Login",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex flex-col">
            <span className="text-white">
              {new Date(row.createdAt).toLocaleDateString()}
            </span>
            <span className="text-xs text-white/40">
              {row.lastLogin
                ? new Date(row.lastLogin).toLocaleDateString()
                : "Never"}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("plan", {
      header: "Plan",
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${info.getValue() === "FREE" ? "bg-white/10 text-white/70" : "bg-blue-500/20 text-blue-400"}`}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${info.getValue() === "BANNED" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}
        >
          {info.getValue() || "ACTIVE"}
        </span>
      ),
    }),
    columnHelper.display({
      id: "limits",
      header: "Limits",
      cell: (props) => {
        const user = props.row.original;
        const hasOverrides =
          user.maxConcurrentOverride != null ||
          user.queueDelayOverride != null ||
          user.priorityOverride != null;

        if (!hasOverrides) {
          return <span className="text-xs text-white/40">Default</span>;
        }

        return (
          <div className="flex flex-col text-[10px] text-purple-400 font-mono">
            {user.maxConcurrentOverride != null && (
              <span>Max: {user.maxConcurrentOverride}</span>
            )}
            {user.queueDelayOverride != null && (
              <span>Delay: {user.queueDelayOverride}ms</span>
            )}
            {user.priorityOverride != null && (
              <span>Pri: {user.priorityOverride}</span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("credits", {
      header: "Credits / Gens",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex flex-col">
            <span className="text-amber-400 font-mono font-medium">
              {row.credits} cr
            </span>
            <span className="text-xs text-white/40 font-mono">
              {row.generationCount || 0} gens
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (props) => {
        const user = props.row.original;
        return (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEditingCredits(user)}
              className="text-[10px] uppercase font-bold tracking-wider bg-white/5 hover:bg-white/10 text-white px-2 py-1 rounded transition-colors border border-white/5"
            >
              Credits
            </button>
            <button
              onClick={() => setChangingPlan(user)}
              className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-2 py-1 rounded transition-colors border border-blue-500/20"
            >
              Plan
            </button>
            <button
              onClick={() => setEditingLimits(user)}
              className="text-[10px] uppercase font-bold tracking-wider bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-2 py-1 rounded transition-colors border border-purple-500/20"
            >
              Limits
            </button>
            {user.status === "BANNED" ? (
              <button
                onClick={() => {
                  if (confirm("Unban user?"))
                    adminApi.unbanUser(user.id).then(loadData);
                }}
                className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded transition-colors border border-emerald-500/20"
              >
                Unban
              </button>
            ) : (
              <button
                onClick={() => {
                  if (confirm("Ban user?"))
                    adminApi.banUser(user.id).then(loadData);
                }}
                className="text-[10px] uppercase font-bold tracking-wider bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded transition-colors border border-red-500/20"
              >
                Ban
              </button>
            )}
            <button
              onClick={() =>
                setUserToDelete({ id: user.id, email: user.email })
              }
              className="text-[10px] uppercase font-bold tracking-wider bg-red-900/30 hover:bg-red-900/50 text-red-400 px-2 py-1 rounded transition-colors border border-red-500/20"
            >
              Delete
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Access"
        description="Manage user accounts, roles, and API limits."
        actions={
          <button
            onClick={() => setImporting(true)}
            className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Import CSV
          </button>
        }
      />

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-wrap gap-4 lg:gap-6">
        <BentoCard
          colSpan={0}
          rowSpan={0}
          delay={0.1}
          className="flex-auto min-w-[300px]"
        >
          <div className="flex items-center gap-2 opacity-50 mb-4">
            <Search className="w-4 h-4 text-white" />
            <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
              Search Users
            </span>
          </div>
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4"
          >
            <input
              type="text"
              placeholder="Search by email or name..."
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors appearance-none flex-1"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="" className="bg-[#0f0f0f]">
                  All Roles
                </option>
                <option value="USER" className="bg-[#0f0f0f]">
                  User
                </option>
                <option value="ADMIN" className="bg-[#0f0f0f]">
                  Admin
                </option>
              </select>
              <button
                type="submit"
                className="bg-white/10 text-white border border-white/10 px-6 py-3 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors flex-1"
              >
                Find
              </button>
            </div>
          </form>
        </BentoCard>

        <BentoCard
          colSpan={0}
          rowSpan={0}
          delay={0.2}
          gradient="from-blue-500/10 to-transparent"
          className="flex-1 min-w-[200px]"
        >
          <div className="flex flex-col h-full justify-between gap-4">
            <div className="flex items-start justify-between opacity-50 gap-4">
              <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                Total Users
              </span>
              <Users className="w-4 h-4 flex-shrink-0" />
            </div>
            <div className="text-4xl font-bold tracking-tight text-white">
              {total.toLocaleString()}
            </div>
          </div>
        </BentoCard>
      </div>

      {/* TABLE */}
      <BentoCard
        colSpan={0}
        rowSpan={0}
        delay={0.3}
        noPadding
        className="w-full"
      >
        <div className="p-6 border-b border-white/5 flex items-start gap-2 opacity-50">
          <Users className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
            User Database
          </span>
        </div>
        <div className="overflow-x-auto w-full custom-scrollbar pb-2">
          <table className="w-full min-w-[900px] text-left text-sm text-white/70">
            <thead className="text-[10px] text-white/40 uppercase tracking-wider bg-white/5 border-b border-white/5">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 font-bold whitespace-nowrap"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-white/40"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span className="text-xs uppercase tracking-widest">
                        Loading...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-white/40"
                  >
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/5 flex justify-between items-center bg-black/20">
          <div className="text-xs font-medium text-white/40">
            Showing <span className="text-white">{data.length}</span> of{" "}
            <span className="text-white">{total}</span>
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-30 hover:bg-white/10 transition-colors text-white"
            >
              Prev
            </button>
            <button
              disabled={data.length < 20}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-30 hover:bg-white/10 transition-colors text-white"
            >
              Next
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Shadcn Dialogs */}
      <Dialog
        open={!!editingCredits}
        onOpenChange={(open) => !open && setEditingCredits(null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-md bg-[#0f0f0f] border-white/10 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Manage Credits
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-white/50">
              Editing balance for{" "}
              <strong className="text-white">{editingCredits?.email}</strong>
            </p>
            <form onSubmit={handleAddCredits} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Amount (can be negative)
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="e.g. 100 or -50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Reason (for Audit Log)
                </label>
                <input
                  type="text"
                  name="reason"
                  required
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="e.g. Bonus for reporting a bug"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCredits(null)}
                  className="px-4 py-2 text-sm font-bold text-white/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Plan Dialog */}
      <Dialog
        open={!!changingPlan}
        onOpenChange={(open) => !open && setChangingPlan(null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-md bg-[#0f0f0f] border-white/10 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Change Subscription Plan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-white/50">
              Updating plan for{" "}
              <strong className="text-white">{changingPlan?.email}</strong>
            </p>
            <form onSubmit={handleChangePlan} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Select Plan
                </label>
                <select
                  name="plan"
                  defaultValue={changingPlan?.plan}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none"
                >
                  <option value="FREE" className="bg-[#0f0f0f]">
                    Free
                  </option>
                  <option value="PRO" className="bg-[#0f0f0f]">
                    Pro
                  </option>
                  <option value="ENTERPRISE" className="bg-[#0f0f0f]">
                    Enterprise
                  </option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setChangingPlan(null)}
                  className="px-4 py-2 text-sm font-bold text-white/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Limits Dialog */}
      <Dialog
        open={!!editingLimits}
        onOpenChange={(open) => !open && setEditingLimits(null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-md bg-[#0f0f0f] border-white/10 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Override Limits
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-white/50">
              Set custom limits for{" "}
              <strong className="text-white">{editingLimits?.email}</strong>.
              Leave blank to use plan defaults.
            </p>
            <form onSubmit={handleUpdateLimits} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Max Concurrent Tasks
                </label>
                <input
                  type="number"
                  name="maxConcurrentOverride"
                  defaultValue={
                    (editingLimits as any)?.maxConcurrentOverride ?? ""
                  }
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="e.g. 5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Queue Delay (ms)
                </label>
                <input
                  type="number"
                  name="queueDelayOverride"
                  defaultValue={
                    (editingLimits as any)?.queueDelayOverride ?? ""
                  }
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="e.g. 0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Priority (BullMQ)
                </label>
                <input
                  type="number"
                  name="priorityOverride"
                  defaultValue={(editingLimits as any)?.priorityOverride ?? ""}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="e.g. 1 (lower is higher)"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingLimits(null)}
                  className="px-4 py-2 text-sm font-bold text-white/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={importing} onOpenChange={setImporting}>
        <DialogContent className="w-[95vw] sm:max-w-2xl bg-[#0f0f0f] border-white/10 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Import Users (CSV)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-white/50">
              Paste your CSV contents below. Only the first column (Email) will
              be parsed.
            </p>
            <div className="space-y-4">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full h-64 bg-black/30 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-white/30 transition-colors custom-scrollbar"
                placeholder="user1@example.com, ...&#10;user2@example.com, ..."
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setImporting(false);
                    setImportText("");
                  }}
                  className="px-4 py-2 text-sm font-bold text-white/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Import Users
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        itemName={`пользователя ${userToDelete?.email}`}
        isLoading={deletingUser}
      />
    </div>
  );
}
