import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

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
      message.success('Dang nhap thanh cong');
      navigate('/dashboard');
    } else if (result === 'otp') {
      message.info('Vui long nhap ma OTP');
      setCountdown(30);
    } else {
      message.error('Sai ten dang nhap hoac mat khau');
    }
  };

  const handleVerifyOtp = useCallback(async () => {
    if (otpValue.length !== 6) return;
    setLoading(true);
    const ok = await verifyOtp(otpValue);
    setLoading(false);
    if (ok) {
      message.success('Xac thuc thanh cong');
      navigate('/dashboard');
    } else {
      message.error('Ma OTP khong dung');
      setOtpValue('');
    }
  }, [otpValue, verifyOtp, navigate]);

  const handleResend = async () => {
    const ok = await resendOtp();
    if (ok) {
      message.success('Da gui lai ma OTP');
      setCountdown(30);
    } else {
      message.error('Khong the gui lai OTP');
    }
  };

  if (otpPending) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <Card style={{ width: 420, textAlign: 'center' }}>
          <MedicineBoxOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={4}>Xac thuc hai yeu to</Title>
          <Text type="secondary">Ma OTP da gui den {otpPending.maskedEmail}</Text>
          <div style={{ margin: '24px 0' }}>
            <Input.OTP
              length={6}
              value={otpValue}
              onChange={setOtpValue}
              size="large"
            />
          </div>
          <Space orientation="vertical" style={{ width: '100%' }}>
            <Button type="primary" block size="large" loading={loading} onClick={handleVerifyOtp} disabled={otpValue.length !== 6}>
              Xac nhan
            </Button>
            <Button block onClick={handleResend} disabled={countdown > 0}>
              {countdown > 0 ? `Gui lai sau ${countdown}s` : 'Gui lai OTP'}
            </Button>
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={cancelOtp}>
              Quay lai dang nhap
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <MedicineBoxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <Title level={3} style={{ marginTop: 12, marginBottom: 4 }}>CHIS</Title>
          <Text type="secondary">He thong thong tin y te co so</Text>
        </div>
        <Form form={form} layout="vertical" onFinish={handleLogin} autoComplete="off">
          <Form.Item name="username" rules={[{ required: true, message: 'Nhap ten dang nhap' }]}>
            <Input prefix={<UserOutlined />} placeholder="Ten dang nhap" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Nhap mat khau' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mat khau" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Dang nhap
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
