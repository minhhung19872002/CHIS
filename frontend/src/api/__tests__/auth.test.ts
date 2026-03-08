import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi } from '../auth'
import client from '../client'

vi.mock('../client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should call POST /auth/login with credentials', async () => {
      const mockResponse = { data: { token: 'jwt', user: { id: '1' } } }
      vi.mocked(client.post).mockResolvedValue(mockResponse)

      const result = await authApi.login({ username: 'admin', password: 'Admin@123' })

      expect(client.post).toHaveBeenCalledWith('/auth/login', {
        username: 'admin',
        password: 'Admin@123',
      })
      expect(result.data.token).toBe('jwt')
    })

    it('should propagate error on invalid credentials', async () => {
      vi.mocked(client.post).mockRejectedValue(new Error('Unauthorized'))

      await expect(authApi.login({ username: 'bad', password: 'wrong' }))
        .rejects.toThrow('Unauthorized')
    })
  })

  describe('verifyOtp', () => {
    it('should call POST /auth/verify-otp', async () => {
      const mockResponse = { data: { token: 'jwt', user: { id: '1' } } }
      vi.mocked(client.post).mockResolvedValue(mockResponse)

      await authApi.verifyOtp({ userId: 'user-1', otp: '123456' })

      expect(client.post).toHaveBeenCalledWith('/auth/verify-otp', {
        userId: 'user-1',
        otp: '123456',
      })
    })
  })

  describe('resendOtp', () => {
    it('should call POST /auth/resend-otp with userId', async () => {
      vi.mocked(client.post).mockResolvedValue({ data: {} })

      await authApi.resendOtp('user-1')

      expect(client.post).toHaveBeenCalledWith('/auth/resend-otp', { userId: 'user-1' })
    })
  })

  describe('getProfile', () => {
    it('should call GET /auth/profile', async () => {
      const mockUser = { id: '1', username: 'admin', fullName: 'Admin' }
      vi.mocked(client.get).mockResolvedValue({ data: mockUser })

      const result = await authApi.getProfile()

      expect(client.get).toHaveBeenCalledWith('/auth/profile')
      expect(result.data.username).toBe('admin')
    })
  })

  describe('changePassword', () => {
    it('should call POST /auth/change-password', async () => {
      vi.mocked(client.post).mockResolvedValue({ data: {} })

      await authApi.changePassword({ oldPassword: 'old', newPassword: 'new' })

      expect(client.post).toHaveBeenCalledWith('/auth/change-password', {
        oldPassword: 'old',
        newPassword: 'new',
      })
    })
  })

  describe('2FA', () => {
    it('should get 2FA status', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: { isEnabled: true } })

      const result = await authApi.getTwoFactorStatus()

      expect(client.get).toHaveBeenCalledWith('/auth/2fa-status')
      expect(result.data.isEnabled).toBe(true)
    })

    it('should enable 2FA', async () => {
      vi.mocked(client.post).mockResolvedValue({ data: {} })

      await authApi.enableTwoFactor('test@example.com')

      expect(client.post).toHaveBeenCalledWith('/auth/enable-2fa', { email: 'test@example.com' })
    })

    it('should disable 2FA', async () => {
      vi.mocked(client.post).mockResolvedValue({ data: {} })

      await authApi.disableTwoFactor()

      expect(client.post).toHaveBeenCalledWith('/auth/disable-2fa')
    })
  })
})
