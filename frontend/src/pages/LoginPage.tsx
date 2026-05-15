import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError('')
    try {
      await login(data.username, data.password)
      navigate('/')
    } catch (err) {
      setError('Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-soc-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glassmorphism p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-8 text-soc-accent">
          Hybrid SOC Login
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              {...register('username')}
              type="text"
              className="w-full px-3 py-2 bg-soc-gray border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-soc-accent"
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="text-soc-critical text-sm mt-1">{errors.username.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-3 py-2 bg-soc-gray border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-soc-accent"
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-soc-critical text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          {error && (
            <p className="text-soc-critical text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-soc-accent hover:bg-soc-accent/80 disabled:opacity-50 text-black font-semibold py-2 px-4 rounded-md transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default LoginPage