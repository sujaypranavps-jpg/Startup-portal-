import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import { notificationApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';

const NotificationsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationApi.list().then((r) => r.data) });

  useSocket(user?._id, () => {
    toast.success('New notification');
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  });

  const markAll = useMutation({
    mutationFn: () => notificationApi.readAll(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  useEffect(() => {
    if (!data?.notifications?.length) return;
  }, [data]);

  return (
    <AppShell>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading text-2xl">Notifications</h1>
          <button className="btn-secondary" onClick={() => markAll.mutate()}>Mark All Read</button>
        </div>
        <div className="space-y-3">
          {data?.notifications?.map((item) => (
            <div key={item._id} className={`rounded-xl border p-4 ${item.read ? 'border-slate-100' : 'border-brand-200 bg-brand-50'}`}>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-slate-600">{item.message}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default NotificationsPage;
