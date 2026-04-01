import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Ideas Launched', value: '1,240+' },
  { label: 'Mentor Reviews', value: '8,900+' },
  { label: 'Funding Facilitated', value: '$42M+' }
];

const LandingPage = () => (
  <div className="min-h-screen">
    <header className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
      <h1 className="font-heading text-2xl text-brand-600">VentureFlow</h1>
      <div className="flex gap-3">
        <Link className="btn-secondary" to="/login">Login</Link>
        <Link className="btn-primary" to="/register">Sign Up</Link>
      </div>
    </header>

    <section className="max-w-7xl mx-auto px-4 py-14 grid lg:grid-cols-2 gap-10 items-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-brand-600 font-semibold mb-3">Startup Idea Management Portal</p>
        <h2 className="font-heading text-4xl md:text-5xl leading-tight text-slate-900">
          Professional pipeline from idea to investment.
        </h2>
        <p className="text-slate-600 mt-5 text-lg">
          VentureFlow helps startups submit and track ideas, mentors provide structured reviews, and investors discover vetted opportunities.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="btn-primary" to="/register">Create Account</Link>
          <Link className="btn-secondary" to="/login">Access Dashboard</Link>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6">
        <div className="grid sm:grid-cols-3 gap-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-100 p-4 bg-slate-50">
              <p className="font-heading text-2xl text-slate-900">{item.value}</p>
              <p className="text-sm text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-slate-500">Built for startups, mentors, investors, and admins with role-based security and real-time notifications.</p>
      </motion.div>
    </section>
  </div>
);

export default LandingPage;
