import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import StatCard from '../../components/common/StatCard';
import { investmentApi, ideaApi } from '../../api/endpoints';

const InvestorInterestsPage = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['investor-interests'], queryFn: () => investmentApi.my().then((r) => r.data) });
  const ideasQuery = useQuery({ queryKey: ['investor-approved-ideas'], queryFn: () => ideaApi.listIdeas({ status: 'approved' }).then((r) => r.data) });
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

  const cancelMutation = useMutation({
    mutationFn: (id) => investmentApi.cancel(id),
    onSuccess: () => {
      toast.success('Request cancelled');
      queryClient.invalidateQueries({ queryKey: ['investor-interests'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to cancel request')
  });

  const stats = useMemo(() => {
    const requests = (data?.requests || []).filter((r) => r.status !== 'rejected');
    const total = requests.length;
    const accepted = requests.filter((r) => r.status === 'accepted').length;
    const pending = requests.filter((r) => r.status === 'pending').length;
    return { total, accepted, pending };
  }, [data?.requests]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl">Investor Workspace</h1>
            <p className="text-sm text-slate-500">Track your interests and review approved opportunities.</p>
          </div>
          <button className="btn-primary">Explore Ideas</button>
        </div>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Interests" value={stats.total} />
          <StatCard title="Pending" value={stats.pending} />
          <StatCard title="Accepted" value={stats.accepted} />
          <StatCard title="Approved Ideas" value={ideasQuery.data?.ideas?.length || 0} />
        </section>

        <section className="grid lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="card p-5">
              <h2 className="font-heading text-xl">Send Investment Request</h2>
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <label className="text-sm md:col-span-2">
                  Select Idea
                  <select
                    className="input mt-2"
                    value={request.ideaId}
                    onChange={(e) => setRequest((prev) => ({ ...prev, ideaId: e.target.value }))}
                  >
                    <option value="">Choose approved idea</option>
                    {(ideasQuery.data?.ideas || []).map((idea) => (
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
                <label className="text-sm md:col-span-2">
                  Note
                  <textarea
                    className="input mt-2 min-h-[90px]"
                    placeholder="Share your interest and next steps."
                    value={request.note}
                    onChange={(e) => setRequest((prev) => ({ ...prev, note: e.target.value }))}
                  />
                </label>
              </div>
              <button
                className="btn-primary mt-4"
                disabled={!request.ideaId || createMutation.isPending}
                onClick={() => createMutation.mutate(request)}
              >
                Submit Request
              </button>
            </div>

            <div className="card p-5 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl">My Investment Interests</h2>
                <button className="btn-secondary">Filter</button>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-500"><th>Idea</th><th>Amount</th><th>Type</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {(data?.requests || []).filter((item) => item.status !== 'rejected').map((item) => (
                    <tr key={item._id} className="border-t border-slate-100">
                      <td className="py-2 font-semibold text-slate-800">{item.ideaId?.title}</td>
                      <td>${item.amount.toLocaleString()}</td>
                      <td className="text-slate-600">{item.partnershipType}</td>
                      <td>
                        <span className={item.status === 'accepted' ? 'badge-green' : item.status === 'rejected' ? 'badge-amber' : 'badge-slate'}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.status === 'pending' ? (
                          <button
                            className="btn-secondary !py-1"
                            onClick={() => cancelMutation.mutate(item._id)}
                            disabled={cancelMutation.isPending}
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data?.requests?.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-slate-500">No investment requests yet.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-heading text-lg">Top Approved Ideas</h3>
              <div className="mt-4 space-y-3">
                {(ideasQuery.data?.ideas || []).slice(0, 3).map((idea) => (
                  <div key={idea._id} className="border border-slate-100 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{idea.title}</p>
                        <p className="text-xs text-slate-500">{idea.industry} | {idea.stage}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{idea.description}</p>
                    <p className="text-xs text-slate-500 mt-2">Mentor feedback: {idea.feedback || 'No feedback yet.'}</p>
                  </div>
                ))}
                {(ideasQuery.data?.ideas || []).length === 0 ? (
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
};

export default InvestorInterestsPage;
