import React, { useState, useEffect } from "react";
import adminService from "../services/admin";

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

      {loading && <div className="text-center py-10">Loading...</div>}

      {!loading && !error && activeTab === "stats" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats.total_users} />
          <StatCard title="Premium Users" value={stats.premium_users} />
          <StatCard title="Active Users (30d)" value={stats.active_users} />
          <StatCard title="Total Invoices" value={stats.total_invoices} />
          <StatCard
            title="Total Revenue"
            value={`Rp ${parseInt(stats.total_revenue).toLocaleString()}`}
          />
        </div>
      )}

      {!loading && !error && activeTab === "users" && (
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
          </div>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-500">Name</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Email</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Plan</th>
                  <th className="px-6 py-4 font-medium text-gray-500">
                    Expires
                  </th>
                  <th className="px-6 py-4 font-medium text-gray-500">Role</th>
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
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                        {user.plan === "premium" && user.subscription_expires_at
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
                              plan: user.plan === "free" ? "premium" : "free",
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
                          {user.role === "super_admin" ? "Demote" : "Promote"}
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
        </div>
      )}

      {!loading && !error && activeTab === "payments" && (
        <div>
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
                    <tr key={payment.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-medium">{payment.user?.name}</div>
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
                    <td colSpan="5" className="p-10 text-center text-slate-500">
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
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
    <h3 className="text-slate-500 text-sm font-medium mb-2">{title}</h3>
    <div className="text-3xl font-bold text-slate-800">{value}</div>
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
