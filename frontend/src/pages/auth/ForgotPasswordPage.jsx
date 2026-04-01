import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../api/client';

const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post('/auth/forgot-password', values);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-md p-8 space-y-4">
        <h1 className="font-heading text-3xl text-slate-900">Forgot Password</h1>
        <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Email" {...register('email', { required: true })} />
        <button disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Submitting...' : 'Send Reset Instructions'}</button>
        <p className="text-sm text-slate-500"><Link className="text-brand-600" to="/login">Back to login</Link></p>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
