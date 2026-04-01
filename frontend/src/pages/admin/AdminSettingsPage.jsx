import AppShell from '../../components/layout/AppShell';

const AdminSettingsPage = () => (
  <AppShell>
    <div className="card p-6">
      <h1 className="font-heading text-2xl">System Settings</h1>
      <p className="text-slate-600 mt-2">Production settings can be managed through environment variables and deployment dashboards.</p>
      <ul className="mt-4 text-sm text-slate-600 list-disc pl-5 space-y-1">
        <li>Rate limiting and CORS from backend config.</li>
        <li>Email SMTP and Cloudinary credentials from backend `.env`.</li>
        <li>Role policies from middleware and route guards.</li>
      </ul>
    </div>
  </AppShell>
);

export default AdminSettingsPage;
