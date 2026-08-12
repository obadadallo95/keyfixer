import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logFatalError } from '../startup/errorHandling';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    logFatalError('ReactRenderError', error.message);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4">
          <p className="font-bold mb-2">
            KeyFixer couldn't start correctly.<br/>
            Please quit and reopen the app.
          </p>
          <p dir="rtl" className="font-bold">
            تعذر تشغيل KeyFixer بشكل صحيح.<br/>
            يرجى إغلاق التطبيق وفتحه من جديد.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
