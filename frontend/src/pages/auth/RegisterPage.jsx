import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const schema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  role: yup.string().oneOf(['startup', 'mentor', 'investor']).required()
});

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'startup' }
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await authApi.register(values);
      login({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      toast.success('Account created');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-lg p-8 space-y-4">
        <h1 className="font-heading text-3xl text-slate-900">Create Account</h1>
        <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Full Name" {...register('name')} />
        <p className="text-xs text-rose-500">{errors.name?.message}</p>
        <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Email" {...register('email')} />
        <p className="text-xs text-rose-500">{errors.email?.message}</p>
        <input type="password" className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Password" {...register('password')} />
        <p className="text-xs text-rose-500">{errors.password?.message}</p>
        <select className="w-full rounded-xl border border-slate-200 px-4 py-3" {...register('role')}>
          <option value="startup">Startup User</option>
          <option value="mentor">Mentor</option>
          <option value="investor">Investor</option>
        </select>
        <button disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Creating...' : 'Sign Up'}</button>
        <p className="text-sm text-slate-500">Already have an account? <Link className="text-brand-600" to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default RegisterPage;
