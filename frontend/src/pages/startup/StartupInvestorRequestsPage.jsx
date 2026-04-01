import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import { investmentApi } from '../../api/endpoints';

const StartupInvestorRequestsPage = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['startup-investor-requests'], queryFn: () => investmentApi.startup().then((r) => r.data) });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => investmentApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Request updated');
      queryClient.invalidateQueries({ queryKey: ['startup-investor-requests'] });
    }
  });

  return (
    <AppShell>
      <div className="card p-5 overflow-auto">
        <h1 className="font-heading text-2xl mb-4">Investor Requests</h1>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>Idea</th><th>Investor</th><th>Amount</th><th>Type</th><th>Note</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {data?.requests?.map((item) => (
              <tr key={item._id} className="border-t border-slate-100">
                <td className="py-2">{item.ideaId?.title}</td>
                <td>{item.investorId?.name}</td>
                <td>${item.amount.toLocaleString()}</td>
                <td>{item.partnershipType}</td>
                <td className="text-slate-600">{item.note || '-'}</td>
                <td>{item.status}</td>
                <td className="space-x-2">
                  <button className="btn-primary" onClick={() => statusMutation.mutate({ id: item._id, status: 'accepted' })}>Accept</button>
                  <button className="btn-secondary" onClick={() => statusMutation.mutate({ id: item._id, status: 'rejected' })}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
};

export default StartupInvestorRequestsPage;
