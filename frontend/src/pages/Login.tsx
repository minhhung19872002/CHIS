import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Space } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated, otpPending, login, verifyOtp, resendOtp, cancelOtp } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    const result = await login(values.username, values.password);
    setLoading(false);
    if (result === 'success') {
      message.success('Đăng nhập thành công');
      navigate('/dashboard');
    } else if (result === 'otp') {
      message.info('Vui lòng nhập mã OTP');
      setCountdown(30);
    } else {
      message.error('Sai tên đăng nhập hoặc mật khẩu');
    }
  };

  const handleVerifyOtp = useCallback(async () => {
    if (otpValue.length !== 6) return;
    setLoading(true);
    const ok = await verifyOtp(otpValue);
    setLoading(false);
    if (ok) {
      message.success('Xác thực thành công');
      navigate('/dashboard');
    } else {
      message.error('Mã OTP không đúng');
      setOtpValue('');
    }
  }, [otpValue, verifyOtp, navigate]);

  const handleResend = async () => {
    const ok = await resendOtp();
    if (ok) {
      message.success('Đã gửi lại mã OTP');
      setCountdown(30);
    } else {
      message.error('Không thể gửi lại OTP');
    }
  };

  return (
    <div className="login-shell">
      {/* ── Left Branding Panel ── */}
      <div className="login-brand">
        <div className="login-brand-motifs">
          <div className="med-cross" />
          <div className="med-cross" />
          <div className="med-cross" />
          <div className="med-cross" />
          <div className="med-cross" />
          <div className="med-cross" />
          <div className="med-cross" />
        </div>

        {/* Pulse/ECG line */}
        <div className="login-pulse-line">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
            <polyline
              points="0,30 80,30 100,30 115,8 130,52 145,20 160,40 175,30 250,30 330,30 350,30 365,8 380,52 395,20 410,40 425,30 500,30 580,30 600,30 615,8 630,52 645,20 660,40 675,30 750,30 830,30 850,30 865,8 880,52 895,20 910,40 925,30 1000,30 1080,30 1100,30 1115,8 1130,52 1145,20 1160,40 1175,30 1200,30"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div className="login-brand-content">
          <div className="login-brand-icon">
            {/* Medical cross + heart SVG */}
            <svg viewBox="0 0 48 48">
              <path d="M20 8h8v12h12v8H28v12h-8V28H8v-8h12V8z" />
              <circle cx="24" cy="24" r="22" strokeDasharray="4 3" />
            </svg>
          </div>
          <h1 className="login-brand-title">CHIS</h1>
          <p className="login-brand-sub">
            Hệ thống Thông tin Y tế Cơ sở<br />
            Community Health Information System
          </p>
          <div className="login-brand-features">
            <span className="login-brand-pill">
              <span className="pill-dot" />
              Khám chữa bệnh
            </span>
            <span className="login-brand-pill">
              <span className="pill-dot" />
              Y tế dự phòng
            </span>
            <span className="login-brand-pill">
              <span className="pill-dot" />
              Dược phẩm
            </span>
            <span className="login-brand-pill">
              <span className="pill-dot" />
              Báo cáo thống kê
            </span>
            <span className="login-brand-pill">
              <span className="pill-dot" />
              Quản lý dân số
            </span>
            <span className="login-brand-pill">
              <span className="pill-dot" />
              Tiêm chủng
            </span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="login-form-panel">
        {otpPending ? (
          /* ── OTP Verification ── */
          <div className="login-otp-panel" style={{ textAlign: 'center' }}>
            <div className="login-otp-icon-wrapper">
              <SafetyCertificateOutlined />
            </div>
            <div className="login-otp-title">Xác thực hai yếu tố</div>
            <div className="login-otp-desc">
              Mã OTP đã gửi đến {otpPending.maskedEmail}
            </div>
            <div className="login-otp-input">
              <Input.OTP
                length={6}
                value={otpValue}
                onChange={setOtpValue}
                size="large"
              />
            </div>
            <div className="login-otp-actions">
              <Button
                type="primary"
                block
                size="large"
                loading={loading}
                onClick={handleVerifyOtp}
                disabled={otpValue.length !== 6}
                className="login-submit-btn"
              >
                Xác nhận
              </Button>
              <Button
                block
                onClick={handleResend}
                disabled={countdown > 0}
                className="login-otp-resend"
              >
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại OTP'}
              </Button>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={cancelOtp}
                className="login-otp-back"
              >
                Quay lại đăng nhập
              </Button>
            </div>
          </div>
        ) : (
          /* ── Login Form ── */
          <>
            <div className="login-form-header">
              <p className="login-form-greeting">Chào mừng trở lại</p>
              <h2 className="login-form-title">Đăng nhập hệ thống</h2>
              <p className="login-form-desc">
                Nhập thông tin tài khoản để truy cập hệ thống quản lý y tế cơ sở
              </p>
            </div>

            <div className="login-form-body">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleLogin}
                autoComplete="off"
                requiredMark={false}
                size="large"
              >
                <Form.Item
                  name="username"
                  label="Tên đăng nhập"
                  rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập tên đăng nhập"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu"
                  />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    className="login-submit-btn"
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <div className="login-form-footer">
              <p>
                Hệ thống Thông tin Y tế Cơ sở — Phiên bản 1.0<br />
                Bảo mật bởi xác thực hai yếu tố (2FA) &amp; mã hóa SSL
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
