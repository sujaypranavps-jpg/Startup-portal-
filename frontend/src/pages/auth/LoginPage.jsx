import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      const { data } = await authApi.login(values);
      login({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      toast.success('Welcome back');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-md p-8 space-y-4">
        <h1 className="font-heading text-3xl text-slate-900">Login</h1>
        <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Email" {...register('email', { required: true })} />
        <input type="password" className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Password" {...register('password', { required: true })} />
        <button disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Signing in...' : 'Login'}</button>
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">No account? <Link className="text-brand-600" to="/register">Sign up</Link></p>
          <Link className="text-brand-600" to="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
