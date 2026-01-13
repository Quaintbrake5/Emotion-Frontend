import { authAPI } from '../api/api';
import type { User, Token, UserCreate, UserUpdate, OTPSetupResponse } from '../api/api';

export const authService = {
  async login(username: string, password: string): Promise<Token> {
    const response = await authAPI.login(username, password);
    return response.data;
  },

  async register(userData: UserCreate): Promise<User> {
    const response = await authAPI.register(userData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await authAPI.getCurrentUser();
    return response.data;
  },

  async updateUser(userData: UserUpdate): Promise<User> {
    const response = await authAPI.updateCurrentUser(userData);
    return response.data;
  },

  async deleteUser(): Promise<void> {
    await authAPI.deleteCurrentUser();
  },

  async requestPasswordReset(email: string): Promise<void> {
    await authAPI.requestPasswordReset(email);
  },

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    await authAPI.confirmPasswordReset(token, newPassword);
  },

  async requestEmailVerification(): Promise<void> {
    await authAPI.requestEmailVerification();
  },

  async confirmEmailVerification(token: string): Promise<void> {
    await authAPI.confirmEmailVerification(token);
  },

  async refreshToken(refreshToken: string): Promise<Token> {
    const response = await authAPI.refreshToken(refreshToken);
    return response.data;
  },

  async setupOTP(password: string): Promise<OTPSetupResponse> {
    const response = await authAPI.setupOTP(password);
    return response.data;
  },

  async verifyOTP(otpCode: string): Promise<void> {
    await authAPI.verifyOTP(otpCode);
  },

  async disableOTP(password: string): Promise<void> {
    await authAPI.disableOTP(password);
  },

  async verifyOTPLogin(otpCode: string): Promise<void> {
    await authAPI.verifyOTPLogin(otpCode);
  },

  async verifyBackupCode(backupCode: string): Promise<void> {
    await authAPI.verifyBackupCode(backupCode);
  },
};
