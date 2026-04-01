import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import { ideaApi } from '../../api/endpoints';

const MyIdeasPage = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['my-ideas'], queryFn: () => ideaApi.myIdeas().then((r) => r.data) });

  const deleteMutation = useMutation({
    mutationFn: (id) => ideaApi.deleteIdea(id),
    onSuccess: () => {
      toast.success('Idea deleted');
      queryClient.invalidateQueries({ queryKey: ['my-ideas'] });
    }
  });

  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="font-heading text-2xl">My Ideas</h1>
        {data?.ideas?.map((idea) => (
          <div className="card p-5" key={idea._id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-heading text-lg">{idea.title}</p>
                <p className="text-sm text-slate-500">{idea.industry} | {idea.stage}</p>
                <p className="text-sm mt-2">Status: <span className="font-semibold">{idea.status}</span></p>
                {idea.feedback ? <p className="text-sm mt-1">Feedback: {idea.feedback}</p> : null}
              </div>
              <button className="btn-secondary" onClick={() => deleteMutation.mutate(idea._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
};

export default MyIdeasPage;
