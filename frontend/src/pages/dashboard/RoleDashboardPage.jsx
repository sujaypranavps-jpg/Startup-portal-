import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import StatCard from '../../components/common/StatCard';
import { ideaApi, investmentApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const RoleDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isStartup = user?.role === 'startup';
  const isInvestor = user?.role === 'investor';

  const startupQuery = useQuery({
    queryKey: ['startup-dashboard'],
    queryFn: () => ideaApi.dashboardStartup().then((r) => r.data),
    enabled: isStartup
  });

  const ideaListQuery = useQuery({
    queryKey: ['startup-my-ideas'],
    queryFn: () => ideaApi.myIdeas().then((r) => r.data),
    enabled: isStartup
  });

  const investorIdeasQuery = useQuery({
    queryKey: ['investor-approved-ideas'],
    queryFn: () => ideaApi.listIdeas({ status: 'approved' }).then((r) => r.data),
    enabled: isInvestor
  });

  const investorRequestsQuery = useQuery({
    queryKey: ['investor-interests'],
    queryFn: () => investmentApi.my().then((r) => r.data),
    enabled: isInvestor
  });

  const [request, setRequest] = useState({ ideaId: '', amount: 50000, partnershipType: 'equity', note: '' });

  const createMutation = useMutation({
    mutationFn: (payload) => investmentApi.create(payload.ideaId, payload),
    onSuccess: () => {
      toast.success('Request submitted');
      queryClient.invalidateQueries({ queryKey: ['investor-interests'] });
      setRequest((prev) => ({ ...prev, note: '' }));
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit request')
  });

  if (isStartup) {
    const ideas = ideaListQuery.data?.ideas || [];
    const interests = startupQuery.data?.interests || [];

    const metrics = useMemo(() => {
      const data = startupQuery.data?.metrics;
      return {
        totalIdeas: data?.totalIdeas || 0,
        pending: data?.pending || 0,
        approved: data?.approved || 0,
        investorInterests: data?.totalInterests || 0
      };
    }, [startupQuery.data]);

    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl">Hello, {user?.name || 'Founder'}.</h1>
              <p className="text-sm text-slate-500">Let's build something great together today.</p>
            </div>
          </div>

          <section className="grid md:grid-cols-3 gap-4">
            <StatCard title="Total Ideas" value={metrics.totalIdeas} hint="+2 this month" />
            <StatCard title="Pending Review" value={metrics.pending} hint="Updated 2h ago" />
            <StatCard title="Investor Requests" value={metrics.investorInterests} hint="High interest" />
          </section>

          <section className="card p-5 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl">My Ideas</h2>
              <button className="text-sm text-brand-600 font-semibold">View All</button>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500"><th>Project Name</th><th>Last Updated</th><th>Status</th><th>Score</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {ideas.map((idea) => (
                  <tr key={idea._id} className="border-t border-slate-100">
                    <td className="py-3 font-semibold text-slate-800">{idea.title}</td>
                    <td className="text-slate-500">{new Date(idea.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={idea.status === 'approved' ? 'badge-green' : idea.status === 'rejected' ? 'badge-amber' : 'badge-slate'}>
                        {idea.status}
                      </span>
                    </td>
                    <td>
                      <div className="h-2 w-28 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500" style={{ width: `${(idea.rating || 3) * 20}%` }} />
                      </div>
                    </td>
                    <td className="text-right">
                      <button className="text-slate-400">?</button>
                    </td>
                  </tr>
                ))}
                {ideas.length === 0 ? (
                  <tr><td className="py-6 text-center text-slate-500" colSpan={5}>No ideas yet.</td></tr>
                ) : null}
              </tbody>
            </table>
          </section>

          <section className="grid lg:grid-cols-[2fr_1fr] gap-6">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl">Investor Requests</h2>
                <span className="text-xs text-slate-400">Live Feed</span>
              </div>
              <div className="space-y-4">
                {interests.map((item) => (
                  <div key={item._id} className="border border-slate-100 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.investorId?.name}</p>
                        <p className="text-xs text-slate-500">Requested {item.ideaId?.title || 'Idea'}</p>
                        <p className="text-xs text-slate-500">Amount: ${item.amount?.toLocaleString?.() || '-'}</p>
                      </div>
                      <span className="badge-slate">{item.status}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">Note: {item.note || '-'}</p>
                    <p className="text-xs text-slate-400 mt-2">{new Date(item.createdAt).toLocaleTimeString()}</p>
                  </div>
                ))}
                {interests.length === 0 ? (
                  <p className="text-sm text-slate-500">No investor interests yet.</p>
                ) : null}
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-br from-blue-600 to-blue-500 text-white">
              <h3 className="font-heading text-xl">Build your pitch deck faster</h3>
              <p className="text-sm text-white/80 mt-3">Use our AI assistant to refine your business model and create investor-ready documents in minutes.</p>
              <button className="mt-4 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg px-4 py-2 flex items-center gap-2">
                <Sparkles size={16} /> Try AI Assistant
              </button>
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  if (isInvestor) {
    const requests = investorRequestsQuery.data?.requests || [];
    const ideas = investorIdeasQuery.data?.ideas || [];
    const total = requests.length;
    const accepted = requests.filter((r) => r.status === 'accepted').length;
    const pending = requests.filter((r) => r.status === 'pending').length;

    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl">Investor Workspace</h1>
              <p className="text-sm text-slate-500">Submit new requests and track your portfolio activity.</p>
            </div>
            <button className="btn-primary">Explore Ideas</button>
          </div>

          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Interests" value={total} />
            <StatCard title="Pending" value={pending} />
            <StatCard title="Accepted" value={accepted} />
            <StatCard title="Approved Ideas" value={ideas.length} />
          </section>

          <section className="grid lg:grid-cols-[2fr_1fr] gap-6">
            <div className="card p-5 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl">My Investment Interests</h2>
                <button className="btn-secondary">Filter</button>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-500"><th>Idea</th><th>Amount</th><th>Type</th><th>Status</th></tr></thead>
                <tbody>
                  {requests.map((item) => (
                    <tr key={item._id} className="border-t border-slate-100">
                      <td className="py-2 font-semibold text-slate-800">{item.ideaId?.title}</td>
                      <td>${item.amount.toLocaleString()}</td>
                      <td className="text-slate-600">{item.partnershipType}</td>
                      <td>
                        <span className={item.status === 'accepted' ? 'badge-green' : item.status === 'rejected' ? 'badge-amber' : 'badge-slate'}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 ? (
                    <tr><td colSpan={4} className="py-6 text-center text-slate-500">No investment requests yet.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="font-heading text-lg">Send Investment Request</h3>
                <div className="mt-4 space-y-3">
                  <label className="text-sm">
                    Select Idea
                    <select
                      className="input mt-2"
                      value={request.ideaId}
                      onChange={(e) => setRequest((prev) => ({ ...prev, ideaId: e.target.value }))}
                    >
                      <option value="">Choose approved idea</option>
                      {ideas.map((idea) => (
                        <option key={idea._id} value={idea._id}>{idea.title}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    Amount (USD)
                    <input
                      type="number"
                      className="input mt-2"
                      value={request.amount}
                      onChange={(e) => setRequest((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                    />
                  </label>
                  <label className="text-sm">
                    Partnership Type
                    <select
                      className="input mt-2"
                      value={request.partnershipType}
                      onChange={(e) => setRequest((prev) => ({ ...prev, partnershipType: e.target.value }))}
                    >
                      <option value="equity">Equity</option>
                      <option value="debt">Debt</option>
                      <option value="convertible">Convertible</option>
                    </select>
                  </label>
                  <label className="text-sm">
                    Note
                    <textarea
                      className="input mt-2 min-h-[90px]"
                      placeholder="Share your interest and next steps."
                      value={request.note}
                      onChange={(e) => setRequest((prev) => ({ ...prev, note: e.target.value }))}
                    />
                  </label>
                  <button
                    className="btn-primary w-full"
                    disabled={!request.ideaId || createMutation.isPending}
                    onClick={() => createMutation.mutate(request)}
                  >
                    Submit Request
                  </button>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-heading text-lg">Approved Ideas</h3>
                <div className="mt-4 space-y-3">
                  {ideas.map((idea) => (
                    <div key={idea._id} className="border border-slate-100 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{idea.title}</p>
                          <p className="text-xs text-slate-500">{idea.industry} | {idea.stage}</p>
                        </div>
                        <button
                          className="btn-secondary !py-1"
                          onClick={() => setRequest((prev) => ({ ...prev, ideaId: idea._id }))}
                        >
                          Request
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-2">{idea.description}</p>
                      <p className="text-xs text-slate-500 mt-2">Mentor feedback: {idea.feedback || 'No feedback yet.'}</p>
                    </div>
                  ))}
                  {ideas.length === 0 ? (
                    <p className="text-sm text-slate-500">No approved ideas yet.</p>
                  ) : null}
                </div>
              </div>

              <div className="card p-5 bg-gradient-to-br from-blue-600 to-blue-500 text-white">
                <h3 className="font-heading text-lg">Deal Flow Alerts</h3>
                <p className="text-sm text-white/80 mt-2">Get notified when new approved ideas match your focus areas.</p>
                <button className="mt-4 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg px-3 py-2">Set Alerts</button>
              </div>
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="card p-6">
        <p className="text-sm text-slate-500">No dashboard available for this role.</p>
      </div>
    </AppShell>
  );
};

export default RoleDashboardPage;
