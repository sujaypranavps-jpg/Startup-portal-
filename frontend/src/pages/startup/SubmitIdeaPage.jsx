import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import { api } from '../../api/client';

const SubmitIdeaPage = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/ideas', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (!event.total) return;
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Idea submitted');
      setUploadProgress(0);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit')
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    mutation.mutate(formData);
  };

  return (
    <AppShell>
      <form className="card p-6 space-y-4" onSubmit={onSubmit}>
        <h1 className="font-heading text-2xl">Submit New Idea</h1>
        <input required name="title" placeholder="Idea title" className="w-full rounded-xl border border-slate-200 px-4 py-3" />
        <textarea required name="description" placeholder="Describe your startup idea" className="w-full rounded-xl border border-slate-200 px-4 py-3 min-h-32" />
        <div className="grid md:grid-cols-2 gap-4">
          <input required name="industry" placeholder="Industry" className="rounded-xl border border-slate-200 px-4 py-3" />
          <select name="stage" className="rounded-xl border border-slate-200 px-4 py-3">
            <option value="concept">Concept</option><option value="mvp">MVP</option><option value="early-revenue">Early Revenue</option><option value="growth">Growth</option><option value="scale">Scale</option>
          </select>
          <input required type="number" name="teamSize" min="1" placeholder="Team size" className="rounded-xl border border-slate-200 px-4 py-3" />
          <input required type="number" name="fundingNeeded" min="0" placeholder="Funding needed" className="rounded-xl border border-slate-200 px-4 py-3" />
        </div>
        <input type="file" name="pitchDeck" accept=".pdf,.ppt,.pptx" className="w-full rounded-xl border border-slate-200 px-4 py-3" />
        {uploadProgress > 0 ? <p className="text-sm text-brand-600">Upload progress: {uploadProgress}%</p> : null}
        <button className="btn-primary" disabled={mutation.isPending}>{mutation.isPending ? 'Submitting...' : 'Submit Idea'}</button>
      </form>
    </AppShell>
  );
};

export default SubmitIdeaPage;
