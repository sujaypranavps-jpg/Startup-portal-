const StatCard = ({ title, value, hint }) => (
  <div className="card p-5">
    <p className="text-sm text-slate-500">{title}</p>
    <p className="text-3xl font-heading font-semibold text-slate-900 mt-2">{value}</p>
    {hint ? <p className="text-xs text-slate-400 mt-2">{hint}</p> : null}
  </div>
);

export default StatCard;
