import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bar } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  BarElement,
  Tooltip
} from 'chart.js';
import {
  Users,
  Lightbulb,
  BadgeDollarSign,
  Download,
  CalendarDays
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import { adminApi, ideaApi } from '../../api/endpoints';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MetricCard = ({ icon: Icon, title, value, trend }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
        <Icon size={18} />
      </div>
      {trend ? <span className="text-xs text-emerald-600 font-semibold">{trend}</span> : null}
    </div>
    <p className="text-sm text-slate-500 mt-4">{title}</p>
    <p className="text-3xl font-heading font-semibold text-slate-900 mt-2">{value}</p>
  </div>
);

const AdminDashboardPage = () => {
  const queryClient = useQueryClient();
  const analyticsQuery = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => ideaApi.dashboardAdmin().then((r) => r.data) });
  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.users().then((r) => r.data) });
  const ideasQuery = useQuery({ queryKey: ['admin-pending-ideas'], queryFn: () => ideaApi.listIdeas({ status: 'pending' }).then((r) => r.data) });
  const investmentsQuery = useQuery({ queryKey: ['admin-investments'], queryFn: () => adminApi.investments().then((r) => r.data) });
  const approvedIdeasQuery = useQuery({ queryKey: ['admin-approved-ideas'], queryFn: () => ideaApi.listIdeas({ status: 'approved' }).then((r) => r.data) });

  const [reviews, setReviews] = useState({});
  const [notice, setNotice] = useState({ targetType: 'all', role: 'startup', userId: '', title: '', message: '', type: 'admin_notice' });

  const reviewMutation = useMutation({
    mutationFn: ({ id, approved, rating, feedback }) => ideaApi.reviewIdea(id, { rating, feedback, approved }),
    onSuccess: () => {
      toast.success('Review saved');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-approved-ideas'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Review failed')
  });

  const notifyMutation = useMutation({
    mutationFn: (payload) => adminApi.notify(payload),
    onSuccess: (res) => {
      toast.success(`Notification sent to ${res.data?.sent || 0} users`);
      setNotice((prev) => ({ ...prev, title: '', message: '' }));
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Notification failed')
  });

  const getReview = (id) => reviews[id] || { rating: 4, suggestion: '', notes: '' };

  const setReviewField = (id, field, value) => {
    setReviews((prev) => ({
      ...prev,
      [id]: { ...getReview(id), [field]: value }
    }));
  };

  const submitReview = (ideaId, approved) => {
    const current = getReview(ideaId);
    const rating = Math.max(1, Math.min(5, Number(current.rating) || 3));
    const parts = [];
    if (current.suggestion?.trim()) parts.push(`Suggestion: ${current.suggestion.trim()}`);
    if (current.notes?.trim()) parts.push(`Notes: ${current.notes.trim()}`);
    const feedback = parts.length > 0 ? parts.join(' | ') : 'Reviewed by admin with no additional notes.';
    reviewMutation.mutate({ id: ideaId, approved, rating, feedback });
  };

  const userChart = useMemo(() => {
    const items = analyticsQuery.data?.usersByRole || [];
    return {
      labels: items.map((i) => i._id),
      datasets: [{ label: 'Users', data: items.map((i) => i.count), backgroundColor: '#93c5fd' }]
    };
  }, [analyticsQuery.data]);

  const ideaChart = useMemo(() => {
    const items = analyticsQuery.data?.ideasByStatus || [];
    return {
      labels: items.map((i) => i._id),
      datasets: [{ label: 'Ideas', data: items.map((i) => i.count), backgroundColor: '#60a5fa' }]
    };
  }, [analyticsQuery.data]);

  const metrics = useMemo(() => {
    const ideasByStatus = analyticsQuery.data?.ideasByStatus || [];
    const usersByRole = analyticsQuery.data?.usersByRole || [];
    const totalIdeas = ideasByStatus.reduce((sum, item) => sum + item.count, 0);
    const approvedIdeas = ideasByStatus.find((item) => item._id === 'approved')?.count || 0;
    const totalUsers = usersByRole.reduce((sum, item) => sum + item.count, 0);
    const totalInvestors = usersByRole.find((item) => item._id === 'investor')?.count || 0;
    const totalFundingRequests = investmentsQuery.data?.requests?.length || 0;
    return { totalIdeas, approvedIdeas, totalInvestors, totalFundingRequests, totalUsers };
  }, [analyticsQuery.data, investmentsQuery.data]);

  const sendNotice = () => {
    const payload = { title: notice.title, message: notice.message, type: notice.type };
    if (notice.targetType === 'role') payload.role = notice.role;
    if (notice.targetType === 'user') payload.userId = notice.userId;
    notifyMutation.mutate(payload);
  };

  const recentApprovals = (approvedIdeasQuery.data?.ideas || []).slice(0, 3);
  const recentUsers = (usersQuery.data?.users || []).slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl">Platform Overview</h1>
            <p className="text-sm text-slate-500 mt-1">Welcome back, Admin. Here’s what’s happening today.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-2"><CalendarDays size={16} /> Last 30 Days</button>
            <button className="btn-primary flex items-center gap-2"><Download size={16} /> Export Data</button>
          </div>
        </div>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={Users} title="Total Users" value={metrics.totalUsers} trend="+12%" />
          <MetricCard icon={Lightbulb} title="Total Ideas" value={metrics.totalIdeas} trend="+5%" />
          <MetricCard icon={BadgeDollarSign} title="Total Investors" value={metrics.totalInvestors} trend="+8%" />
          <MetricCard icon={BadgeDollarSign} title="Funding Requests" value={metrics.totalFundingRequests} />
        </section>

        <section className="grid lg:grid-cols-[2fr_1fr] gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg">Platform Activity Analytics</h2>
              <span className="text-slate-400">?</span>
            </div>
            <div className="mt-4">
              <Bar data={ideaChart} />
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg">Recent Approvals</h2>
              <button className="text-sm text-brand-600 font-semibold">View All</button>
            </div>
            <div className="mt-4 space-y-4">
              {recentApprovals.map((idea) => (
                <div key={idea._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{idea.title}</p>
                    <p className="text-xs text-slate-500">Submitted by {idea.userId?.name || 'Startup'}</p>
                  </div>
                  <span className="badge-green">Approved</span>
                </div>
              ))}
              {recentApprovals.length === 0 ? (
                <p className="text-sm text-slate-500">No approvals yet.</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-heading text-xl mb-4">Recent User Registrations</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500"><th>User</th><th>Role</th><th>Status</th><th>Date Joined</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user._id} className="border-t border-slate-100">
                  <td className="py-3">
                    <p className="font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="text-slate-600 capitalize">{user.role}</td>
                  <td>
                    <span className={user.status === 'blocked' ? 'badge-amber' : 'badge-green'}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="text-right text-slate-400">?</td>
                </tr>
              ))}
              {recentUsers.length === 0 ? (
                <tr><td className="py-6 text-center text-slate-500" colSpan={5}>No recent registrations.</td></tr>
              ) : null}
            </tbody>
          </table>
        </section>

        <section className="grid lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h2 className="font-heading text-xl mb-4">Users by Role</h2>
            <Bar data={userChart} />
          </div>
          <div className="card p-5">
            <h2 className="font-heading text-xl mb-4">Idea Review Panel</h2>
            {(ideasQuery.data?.ideas || []).map((idea) => (
              <div className="border border-slate-100 rounded-xl p-4 mb-3" key={idea._id}>
                <p className="font-semibold text-slate-800">{idea.title}</p>
                <p className="text-xs text-slate-500">{idea.industry} | {idea.stage}</p>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <label className="text-xs">
                    Rating
                    <select
                      className="input mt-1"
                      value={getReview(idea._id).rating}
                      onChange={(e) => setReviewField(idea._id, 'rating', e.target.value)}
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                    </select>
                  </label>
                  <label className="text-xs">
                    Suggestion
                    <textarea
                      className="input mt-1 min-h-[70px]"
                      placeholder="Short suggestion"
                      value={getReview(idea._id).suggestion}
                      onChange={(e) => setReviewField(idea._id, 'suggestion', e.target.value)}
                    />
                  </label>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="btn-primary !py-1" onClick={() => submitReview(idea._id, true)} disabled={reviewMutation.isPending}>Approve</button>
                  <button className="btn-secondary !py-1" onClick={() => submitReview(idea._id, false)} disabled={reviewMutation.isPending}>Reject</button>
                </div>
              </div>
            ))}
            {(ideasQuery.data?.ideas || []).length === 0 ? (
              <p className="text-sm text-slate-500">No pending ideas.</p>
            ) : null}
          </div>
        </section>

        <section className="card p-5 overflow-auto">
          <h2 className="font-heading text-xl mb-4">Funding Requests</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500"><th>Idea</th><th>Investor</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {(investmentsQuery.data?.requests || []).map((request) => (
                <tr key={request._id} className="border-t border-slate-100">
                  <td className="py-2">{request.ideaId?.title || 'Idea'}</td>
                  <td>{request.investorId?.name}</td>
                  <td>${request.amount.toLocaleString()}</td>
                  <td>{request.status}</td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(investmentsQuery.data?.requests || []).length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-center text-slate-500">No funding requests.</td></tr>
              ) : null}
            </tbody>
          </table>
        </section>

        <section className="card p-5">
          <h2 className="font-heading text-xl mb-4">Send Notification</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <label className="text-sm">
              Target
              <select
                className="input mt-2"
                value={notice.targetType}
                onChange={(e) => setNotice((prev) => ({ ...prev, targetType: e.target.value }))}
              >
                <option value="all">All Users</option>
                <option value="role">By Role</option>
                <option value="user">Specific User</option>
              </select>
            </label>
            {notice.targetType === 'role' ? (
              <label className="text-sm">
                Role
                <select
                  className="input mt-2"
                  value={notice.role}
                  onChange={(e) => setNotice((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option value="startup">startup</option>
                  <option value="mentor">mentor</option>
                  <option value="investor">investor</option>
                  <option value="admin">admin</option>
                </select>
              </label>
            ) : null}
            {notice.targetType === 'user' ? (
              <label className="text-sm">
                User Id
                <input
                  className="input mt-2"
                  placeholder="Paste user id"
                  value={notice.userId}
                  onChange={(e) => setNotice((prev) => ({ ...prev, userId: e.target.value }))}
                />
              </label>
            ) : null}
            <label className="text-sm">
              Type
              <input
                className="input mt-2"
                value={notice.type}
                onChange={(e) => setNotice((prev) => ({ ...prev, type: e.target.value }))}
              />
            </label>
            <label className="text-sm md:col-span-2">
              Title
              <input
                className="input mt-2"
                value={notice.title}
                onChange={(e) => setNotice((prev) => ({ ...prev, title: e.target.value }))}
              />
            </label>
            <label className="text-sm md:col-span-3">
              Message
              <textarea
                className="input mt-2 min-h-[90px]"
                value={notice.message}
                onChange={(e) => setNotice((prev) => ({ ...prev, message: e.target.value }))}
              />
            </label>
          </div>
          <button className="btn-primary mt-4" onClick={sendNotice} disabled={notifyMutation.isPending}>Send Notification</button>
        </section>
      </div>
    </AppShell>
  );
};

export default AdminDashboardPage;
