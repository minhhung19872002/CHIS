import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Da xay ra loi"
          subTitle="Trang nay gap su co. Vui long thu lai hoac tai lai trang."
          extra={[
            <Button key="reload" type="primary" onClick={this.handleReload}>
              Tai lai trang
            </Button>,
            <Button key="retry" onClick={this.handleRetry}>
              Thu lai
            </Button>,
          ]}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
