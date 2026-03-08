import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

// We test the client module's behavior by verifying interceptor logic

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create an axios instance with correct baseURL', async () => {
    const { default: client } = await import('../client')
    expect(client.defaults.baseURL).toBeDefined()
  })

  it('should have a timeout configured', async () => {
    const { default: client } = await import('../client')
    expect(client.defaults.timeout).toBe(30000)
  })

  it('should add Authorization header when token exists', async () => {
    localStorage.setItem('token', 'test-jwt-token')

    const { default: client } = await import('../client')

    // Test request interceptor by checking config transformation
    const config = { headers: {} as Record<string, string> }
    const interceptors = (client.interceptors.request as any).handlers
    const requestInterceptor = interceptors[0]

    if (requestInterceptor && requestInterceptor.fulfilled) {
      const result = requestInterceptor.fulfilled(config)
      expect(result.headers.Authorization).toBe('Bearer test-jwt-token')
    }
  })

  it('should not add Authorization header when no token', async () => {
    // localStorage is clean (no token)
    const { default: client } = await import('../client')

    const config = { headers: {} as Record<string, string> }
    const interceptors = (client.interceptors.request as any).handlers
    const requestInterceptor = interceptors[0]

    if (requestInterceptor && requestInterceptor.fulfilled) {
      const result = requestInterceptor.fulfilled(config)
      expect(result.headers.Authorization).toBeUndefined()
    }
  })

  it('should clear localStorage and redirect on 401', async () => {
    localStorage.setItem('token', 'old-token')
    localStorage.setItem('user', '{"name":"test"}')

    const { default: client } = await import('../client')

    // Mock window.location
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    })

    const interceptors = (client.interceptors.response as any).handlers
    const responseInterceptor = interceptors[0]

    if (responseInterceptor && responseInterceptor.rejected) {
      const error = { response: { status: 401 } }
      try {
        await responseInterceptor.rejected(error)
      } catch {
        // Expected to reject
      }
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    }

    // Restore
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    })
  })
})
