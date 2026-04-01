import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import { adminApi } from '../../api/endpoints';

const roles = ['startup', 'mentor', 'investor', 'admin'];

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.users().then((r) => r.data) });

  const updateMutation = useMutation({
    mutationFn: ({ id, role }) => adminApi.updateRole(id, role),
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const exportCsv = async () => {
    try {
      const response = await adminApi.exportIdeas();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ideas-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <AppShell>
      <div className="card p-5 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading text-2xl">User Management</h1>
          <button className="btn-secondary" onClick={exportCsv}>Export Ideas CSV</button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {data?.users?.map((user) => (
              <tr key={user._id} className="border-t border-slate-100">
                <td className="py-2">{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status || 'active'}</td>
                <td className="flex flex-wrap gap-2 py-2">
                  <select defaultValue={user.role} onChange={(e) => updateMutation.mutate({ id: user._id, role: e.target.value })} className="rounded-lg border border-slate-200 px-2 py-1">
                    {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                  <button
                    className="btn-secondary !py-1"
                    onClick={() => statusMutation.mutate({ id: user._id, status: user.status === 'blocked' ? 'active' : 'blocked' })}
                  >
                    {user.status === 'blocked' ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    className="btn-secondary !py-1"
                    onClick={() => {
                      if (window.confirm('Delete this user?')) deleteMutation.mutate(user._id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
};

export default AdminUsersPage;
