import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act, renderHook, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { authApi } from '../../api/auth'
import type { ReactNode } from 'react'

vi.mock('../../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    verifyOtp: vi.fn(),
    resendOtp: vi.fn(),
    getProfile: vi.fn(),
  },
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    // Suppress getProfile call on mount
    vi.mocked(authApi.getProfile).mockRejectedValue(new Error('Not authenticated'))
  })

  describe('initial state', () => {
    it('should not be authenticated initially', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.otpPending).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should restore user from localStorage', () => {
      const storedUser = { id: '1', username: 'admin', fullName: 'Admin', roles: ['Admin'], permissions: [] }
      localStorage.setItem('user', JSON.stringify(storedUser))
      localStorage.setItem('token', 'jwt-token')

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user?.username).toBe('admin')
    })
  })

  describe('login', () => {
    it('should return success and set user on valid login', async () => {
      const mockUser = { id: '1', username: 'admin', fullName: 'Admin', roles: ['Admin'], permissions: ['admin.read'] }
      vi.mocked(authApi.login).mockResolvedValue({
        data: { token: 'jwt-token', user: mockUser, requiresOtp: false },
      } as any)

      const { result } = renderHook(() => useAuth(), { wrapper })

      let loginResult: string | boolean = false
      await act(async () => {
        loginResult = await result.current.login('admin', 'Admin@123')
      })

      expect(loginResult).toBe('success')
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user?.username).toBe('admin')
      expect(localStorage.getItem('token')).toBe('jwt-token')
    })

    it('should return otp when 2FA required', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        data: { requiresOtp: true, otpUserId: 'user-1', maskedEmail: 'te**@example.com', token: '', user: null as any },
      } as any)

      const { result } = renderHook(() => useAuth(), { wrapper })

      let loginResult: string | boolean = false
      await act(async () => {
        loginResult = await result.current.login('admin', 'Admin@123')
      })

      expect(loginResult).toBe('otp')
      expect(result.current.otpPending).toEqual({
        userId: 'user-1',
        maskedEmail: 'te**@example.com',
      })
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should return false on login failure', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Unauthorized'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      let loginResult: string | boolean = false
      await act(async () => {
        loginResult = await result.current.login('bad', 'wrong')
      })

      expect(loginResult).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('verifyOtp', () => {
    it('should verify OTP and authenticate', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        data: { requiresOtp: true, otpUserId: 'user-1', maskedEmail: 'te**@test.com', token: '', user: null as any },
      } as any)

      const mockUser = { id: 'user-1', username: 'admin', fullName: 'Admin', roles: [], permissions: [] }
      vi.mocked(authApi.verifyOtp).mockResolvedValue({
        data: { token: 'jwt-token', user: mockUser },
      } as any)

      const { result } = renderHook(() => useAuth(), { wrapper })

      // First login to trigger OTP
      await act(async () => {
        await result.current.login('admin', 'Admin@123')
      })

      // Then verify OTP
      let verifyResult = false
      await act(async () => {
        verifyResult = await result.current.verifyOtp('123456')
      })

      expect(verifyResult).toBe(true)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.otpPending).toBeNull()
    })

    it('should return false when no OTP pending', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      let verifyResult = false
      await act(async () => {
        verifyResult = await result.current.verifyOtp('123456')
      })

      expect(verifyResult).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear user and localStorage', async () => {
      const mockUser = { id: '1', username: 'admin', fullName: 'Admin', roles: [], permissions: [] }
      vi.mocked(authApi.login).mockResolvedValue({
        data: { token: 'jwt-token', user: mockUser },
      } as any)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('admin', 'Admin@123')
      })

      expect(result.current.isAuthenticated).toBe(true)

      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('permissions', () => {
    it('should check permissions correctly', async () => {
      const mockUser = { id: '1', username: 'admin', fullName: 'Admin', roles: ['Admin'], permissions: ['patient.read', 'patient.write'] }
      vi.mocked(authApi.login).mockResolvedValue({
        data: { token: 'jwt-token', user: mockUser },
      } as any)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('admin', 'Admin@123')
      })

      expect(result.current.hasPermission('patient.read')).toBe(true)
      expect(result.current.hasPermission('patient.delete')).toBe(false)
    })

    it('should check roles correctly', async () => {
      const mockUser = { id: '1', username: 'admin', fullName: 'Admin', roles: ['Admin', 'Doctor'], permissions: [] }
      vi.mocked(authApi.login).mockResolvedValue({
        data: { token: 'jwt-token', user: mockUser },
      } as any)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('admin', 'Admin@123')
      })

      expect(result.current.hasRole('Admin')).toBe(true)
      expect(result.current.hasRole('Nurse')).toBe(false)
    })
  })

  describe('cancelOtp', () => {
    it('should clear OTP pending state', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        data: { requiresOtp: true, otpUserId: 'user-1', maskedEmail: 'te**@test.com', token: '', user: null as any },
      } as any)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('admin', 'Admin@123')
      })

      expect(result.current.otpPending).not.toBeNull()

      act(() => {
        result.current.cancelOtp()
      })

      expect(result.current.otpPending).toBeNull()
    })
  })

  describe('useAuth outside provider', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within AuthProvider')
    })
  })
})
