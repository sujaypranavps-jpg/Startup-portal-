import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import StatCard from '../../components/common/StatCard';
import { ideaApi } from '../../api/endpoints';

const MentorIdeasPage = () => {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const fileBase = apiBase.replace(/\/api\/?$/, '');
  const queryClient = useQueryClient();
  const [reviews, setReviews] = useState({});
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedId, setSelectedId] = useState('');

  const { data } = useQuery({
    queryKey: ['mentor-all-ideas'],
    queryFn: () => ideaApi.listIdeas({}).then((r) => r.data)
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, approved, rating, feedback }) => ideaApi.reviewIdea(id, { rating, feedback, approved }),
    onSuccess: () => {
      toast.success('Review saved');
      queryClient.invalidateQueries({ queryKey: ['mentor-all-ideas'] });
    }
  });

  const ideas = data?.ideas || [];
  const pending = ideas.filter((idea) => idea.status === 'pending');
  const completed = ideas.filter((idea) => idea.status !== 'pending');
  const visible = activeTab === 'pending' ? pending : completed;

  const stats = useMemo(() => {
    const reviewed = completed.length;
    const pendingCount = pending.length;
    const total = ideas.length;
    return { reviewed, pendingCount, total };
  }, [ideas.length, pending.length, completed.length]);

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
    const feedback = parts.length > 0 ? parts.join(' | ') : 'Reviewed by mentor with no additional notes.';
    reviewMutation.mutate({ id: ideaId, approved, rating, feedback });
  };

  const selectedIdea = ideas.find((idea) => idea._id === selectedId);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl">Startup Ideas Review</h1>
            <p className="text-sm text-slate-500">You have {pending.length} new submissions waiting for your expertise.</p>
          </div>
          <button className="btn-secondary">View History</button>
        </div>

        <div className="card p-5">
          <div className="flex gap-6 border-b border-slate-100 text-sm font-semibold">
            <button
              className={`pb-3 ${activeTab === 'pending' ? 'text-brand-600 border-b-2 border-brand-500' : 'text-slate-500'}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Review <span className="ml-2 badge-blue">{pending.length}</span>
            </button>
            <button
              className={`pb-3 ${activeTab === 'completed' ? 'text-brand-600 border-b-2 border-brand-500' : 'text-slate-500'}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </button>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm mt-4">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Startup Name</th>
                  <th>Founder</th>
                  <th>Submission Date</th>
                  <th>Industry</th>
                  <th>Description</th>
                  <th>Pitch Deck</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((idea) => (
                  <tr key={idea._id} className="border-t border-slate-100">
                    <td className="py-3 font-semibold text-slate-800">{idea.title}</td>
                    <td className="text-slate-600">{idea.userId?.name || 'Founder'}</td>
                    <td className="text-slate-500">{new Date(idea.createdAt).toLocaleDateString()}</td>
                    <td><span className="badge-blue">{idea.industry}</span></td>
                    <td className="text-slate-600">
                      <div className="line-clamp-2">{idea.description}</div>
                    </td>
                    <td>
                      {idea.pitchDeck?.url || idea.pitchDeck?.originalName ? (
                        <a
                          href={
                            idea.pitchDeck?.url?.startsWith('http')
                              ? idea.pitchDeck.url
                              : `${fileBase}${idea.pitchDeck?.url || ''}`
                          }
                          className="text-xs text-brand-600"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {idea.pitchDeck?.originalName || 'Open PDF'}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button
                        className="btn-primary !py-1"
                        onClick={() => setSelectedId(idea._id)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 ? (
                  <tr><td className="py-6 text-center text-slate-500" colSpan={7}>No items in this view.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {selectedIdea ? (
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading text-xl">{selectedIdea.title}</p>
                <p className="text-sm text-slate-500">{selectedIdea.industry} | {selectedIdea.stage} | {selectedIdea.userId?.name || 'Founder'}</p>
              </div>
              <span className={selectedIdea.status === 'approved' ? 'badge-green' : selectedIdea.status === 'rejected' ? 'badge-amber' : 'badge-slate'}>
                {selectedIdea.status}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <StatCard title="Overall Rating" value={`${getReview(selectedIdea._id).rating} / 5`} />
              <StatCard title="Business Viability" value="High" hint="Mentor estimate" />
              <StatCard title="Tech Feasibility" value="Medium" hint="Mentor estimate" />
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-700">Founder Description</p>
              <p className="text-sm text-slate-600 mt-1">{selectedIdea.description}</p>
            </div>

            {selectedIdea.pitchDeck?.url || selectedIdea.pitchDeck?.originalName ? (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-700">Pitch Deck</p>
                <a
                  href={
                    selectedIdea.pitchDeck?.url?.startsWith('http')
                      ? selectedIdea.pitchDeck.url
                      : `${fileBase}${selectedIdea.pitchDeck?.url || ''}`
                  }
                  className="text-sm text-brand-600"
                  target="_blank"
                  rel="noreferrer"
                >
                  {selectedIdea.pitchDeck?.originalName || 'View pitch deck'}
                </a>
              </div>
            ) : null}

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <label className="text-sm">
                Rating (1-5)
                <select
                  className="input mt-2"
                  value={getReview(selectedIdea._id).rating}
                  onChange={(e) => setReviewField(selectedIdea._id, 'rating', e.target.value)}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </label>
              <label className="text-sm">
                Suggestion
                <textarea
                  className="input mt-2 min-h-[90px]"
                  placeholder="Provide actionable suggestions to improve the idea."
                  value={getReview(selectedIdea._id).suggestion}
                  onChange={(e) => setReviewField(selectedIdea._id, 'suggestion', e.target.value)}
                />
              </label>
              <label className="text-sm md:col-span-2">
                Notes
                <textarea
                  className="input mt-2 min-h-[90px]"
                  placeholder="Additional notes for the founder."
                  value={getReview(selectedIdea._id).notes}
                  onChange={(e) => setReviewField(selectedIdea._id, 'notes', e.target.value)}
                />
              </label>
            </div>

            <div className="flex gap-3 mt-4">
              <button className="btn-primary" onClick={() => submitReview(selectedIdea._id, true)} disabled={reviewMutation.isPending}>Approve</button>
              <button className="btn-secondary" onClick={() => submitReview(selectedIdea._id, false)} disabled={reviewMutation.isPending}>Reject</button>
            </div>
          </div>
        ) : null}

        <div className="grid md:grid-cols-3 gap-4">
          <StatCard title="Weekly Reviews" value={stats.reviewed} hint="Ideas reviewed this week" />
          <StatCard title="Pending Queue" value={stats.pendingCount} hint="New submissions" />
          <StatCard title="Total Ideas" value={stats.total} hint="Across the platform" />
        </div>
      </div>
    </AppShell>
  );
};

export default MentorIdeasPage;
