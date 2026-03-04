import client from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
  requiresOtp?: boolean;
  otpUserId?: string;
  maskedEmail?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  facilityId?: string;
  facilityName?: string;
}

export interface VerifyOtpRequest {
  userId: string;
  otp: string;
}

export const authApi = {
  login: (data: LoginRequest) => client.post<LoginResponse>('/auth/login', data),
  verifyOtp: (data: VerifyOtpRequest) => client.post<LoginResponse>('/auth/verify-otp', data),
  resendOtp: (userId: string) => client.post('/auth/resend-otp', { userId }),
  getProfile: () => client.get<UserInfo>('/auth/profile'),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    client.post('/auth/change-password', data),
  getTwoFactorStatus: () => client.get<{ isEnabled: boolean }>('/auth/2fa-status'),
  enableTwoFactor: (email: string) => client.post('/auth/enable-2fa', { email }),
  disableTwoFactor: () => client.post('/auth/disable-2fa'),
};
