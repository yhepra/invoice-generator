import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import adminService from "../services/admin";
import {
  Users,
  Crown,
  Activity,
  FileText,
  DollarSign,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === "stats") fetchStats();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "payments") fetchPayments();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load stats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers(page, search);
      setUsers(data.data);
      setPagination(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load users. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getPayments(page);
      setPayments(data.data);
      setPagination(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id, data) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await adminService.updateUser(id, data);
      fetchUsers(pagination.current_page);
    } catch (error) {
      alert("Failed to update user");
    }
  };

  const handleExport = (type) => {
    let data = [];
    let filename = "";

    if (type === "users") {
      data = users.map((user) => ({
        Name: user.name,
        Email: user.email,
        Type: user.google_id ? "Google" : "Email",
        Verified: user.email_verified_at
          ? new Date(user.email_verified_at).toLocaleDateString()
          : "No",
        Plan: user.plan,
        Expires:
          user.plan === "premium" && user.subscription_expires_at
            ? new Date(user.subscription_expires_at).toLocaleDateString()
            : "-",
        Role: user.role,
        Invoices: user.invoices_count,
        Joined: new Date(user.created_at).toLocaleDateString(),
      }));
      filename = "users_export.xlsx";
    } else if (type === "payments") {
      data = payments.map((payment) => ({
        User: payment.user?.name || "N/A",
        Email: payment.user?.email || "N/A",
        Amount: payment.amount,
        Status: payment.status,
        Method: payment.payment_method,
        Date: new Date(payment.created_at).toLocaleDateString(),
      }));
      filename = "payments_export.xlsx";
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">
        Admin Dashboard
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        {["stats", "users", "payments"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize font-medium ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {activeTab === "stats" &&
        (loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={`top-${i}`} />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <SkeletonCard key={`bottom-${i}`} />
              ))}
            </div>
          </>
        ) : (
          stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard
                  title="Total Users"
                  value={stats.total_users}
                  icon={Users}
                  gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                  iconWrapperClass="bg-blue-400/30"
                  titleClass="text-blue-100"
                />
                <StatCard
                  title="Premium Users"
                  value={stats.premium_users}
                  icon={Crown}
                  gradient="bg-gradient-to-br from-amber-500 to-amber-600"
                  iconWrapperClass="bg-amber-400/30"
                  titleClass="text-amber-100"
                />
                <StatCard
                  title="Active Users (30d)"
                  value={stats.active_users}
                  icon={Activity}
                  gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
                  iconWrapperClass="bg-emerald-400/30"
                  titleClass="text-emerald-100"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                  title="Total Invoices"
                  value={stats.total_invoices}
                  icon={FileText}
                  gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                  iconWrapperClass="bg-purple-400/30"
                  titleClass="text-purple-100"
                />
                <StatCard
                  title="Total Revenue"
                  value={`Rp ${parseInt(stats.total_revenue).toLocaleString()}`}
                  icon={DollarSign}
                  gradient="bg-gradient-to-br from-rose-500 to-rose-600"
                  iconWrapperClass="bg-rose-400/30"
                  titleClass="text-rose-100"
                />
              </div>

              {/* Weekly Users Chart */}
              {stats.weekly_users && (
                <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    New Users (Last 12 Weeks)
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.weekly_users}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="users"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{
                            fill: "#3b82f6",
                            strokeWidth: 2,
                            r: 4,
                            stroke: "#fff",
                          }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )
        ))}

      {activeTab === "users" && (
        <div>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Search users..."
              className="border p-2 rounded w-full max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchUsers(1)}
            />
            <button
              onClick={() => fetchUsers(1)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Search
            </button>
            <button
              onClick={() => handleExport("users")}
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>
          {loading ? (
            <SkeletonTable cols={11} />
          ) : (
            <>
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium text-gray-500">
                        No
                      </th>
                      <th className="px-6 py-4 font-medium text-gray-500">
                        Type
                      </th>
                      <th className="px-6 py-4 font-medium text-gray-500">
                        Verified
                      </th>
                      <th className="px-6 py-4 font-medium text-gray-500">
                        Name
                      </th>
                      <th className="px-6 py-4 font-medium text-gray-500">
                        Email
                      </th>
                      <th className="px-6 py-4 font-medium text-gray-500">
                        Plan
                      </th>
                      <th className="px-6 py-4 font-medium text-gray-500">
                        Expires
                      </th>
                      <th className="px-6 py-4 font-medium text-gray-500">
                        Role
                      </th>
                      <th className="px-6 py-4 font-medium text-gray-500">
                        Invoices
                      </th>
                      <th className="px-6 py-4 font-medium text-gray-500">
                        Joined
                      </th>
                      <th className="px-6 py-4 font-medium text-gray-500 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.length > 0 ? (
                      users.map((user, index) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(pagination.current_page - 1) * pagination.per_page +
                              index +
                              1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.google_id ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Google
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                Email
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.google_id || user.email_verified_at ? (
                              <span className="text-green-600">
                                {user.email_verified_at
                                  ? new Date(user.email_verified_at).toLocaleDateString()
                                  : "Verified"}
                              </span>
                            ) : (
                              <span className="text-red-500">Unverified</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.plan === "premium"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.plan === "premium" &&
                            user.subscription_expires_at
                              ? new Date(
                                  user.subscription_expires_at,
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.invoices_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                            <button
                              onClick={() =>
                                handleUpdateUser(user.id, {
                                  plan:
                                    user.plan === "free" ? "premium" : "free",
                                })
                              }
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Switch Plan
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateUser(user.id, {
                                  role:
                                    user.role === "super_admin"
                                      ? "user"
                                      : "super_admin",
                                })
                              }
                              className="text-amber-600 hover:text-amber-900 ml-2"
                            >
                              {user.role === "super_admin"
                                ? "Demote"
                                : "Promote"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-6 py-10 text-center text-gray-500"
                        >
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                data={pagination}
                onPageChange={(page) => fetchUsers(page)}
              />
            </>
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => handleExport("payments")}
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>
          {loading ? (
            <SkeletonTable cols={5} />
          ) : (
            <>
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length > 0 ? (
                      payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="p-4">
                            <div className="font-medium">
                              {payment.user?.name}
                            </div>
                            <div className="text-slate-500 text-xs">
                              {payment.user?.email}
                            </div>
                          </td>
                          <td className="p-4">
                            Rp {parseInt(payment.amount).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                payment.status === "PAID"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {payment.payment_channel} - {payment.payment_method}
                          </td>
                          <td className="p-4">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-10 text-center text-slate-500"
                        >
                          No payments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                data={pagination}
                onPageChange={(page) => fetchPayments(page)}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  iconWrapperClass,
  titleClass,
}) => (
  <div
    className={`relative overflow-hidden rounded-xl ${gradient} p-6 text-white shadow-lg transition-transform hover:scale-105`}
  >
    <div className="relative z-10">
      <div className="flex items-center gap-2">
        <div className={`rounded-full ${iconWrapperClass} p-2`}>
          <Icon size={20} className="text-white" />
        </div>
        <p className={`font-medium ${titleClass}`}>{title}</p>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
    </div>
    {/* Decorative Icon */}
    <div className="absolute -right-6 -bottom-6 opacity-10">
      <Icon size={128} />
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="relative overflow-hidden rounded-xl bg-gray-200 p-6 shadow-lg animate-pulse h-40">
    <div className="flex items-center gap-2 mb-4">
      <div className="h-10 w-10 rounded-full bg-gray-300"></div>
      <div className="h-4 w-24 bg-gray-300 rounded"></div>
    </div>
    <div className="h-8 w-16 bg-gray-300 rounded"></div>
  </div>
);

const SkeletonTable = ({ cols = 5, rows = 5 }) => (
  <div className="overflow-x-auto bg-white rounded-lg shadow">
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 border-b">
        <tr>
          {[...Array(cols)].map((_, i) => (
            <th key={i} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {[...Array(rows)].map((_, i) => (
          <tr key={i}>
            {[...Array(cols)].map((_, j) => (
              <td key={j} className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Pagination = ({ data, onPageChange }) => {
  if (!data || !data.links) return null;
  return (
    <div className="flex justify-center gap-2 mt-4">
      {data.links.map((link, idx) => (
        <button
          key={idx}
          onClick={() => {
            if (link.url) {
              const url = new URL(link.url);
              const page = url.searchParams.get("page");
              onPageChange(page);
            }
          }}
          disabled={!link.url || link.active}
          className={`px-3 py-1 rounded ${
            link.active
              ? "bg-blue-600 text-white"
              : !link.url
                ? "text-slate-300"
                : "bg-white border hover:bg-slate-50"
          }`}
          dangerouslySetInnerHTML={{ __html: link.label }}
        />
      ))}
    </div>
  );
};

export default AdminDashboard;
