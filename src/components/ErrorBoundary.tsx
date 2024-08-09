"use client";
import { AlertCircle } from "lucide-react";
import React, { PropsWithChildren } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: unknown;
}

interface ErrorBoundaryProps {
  text?: string;
  boundaryName: string;
}

export class ErrorBoundary extends React.Component<
  PropsWithChildren<ErrorBoundaryProps>,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    console.error("Error: ", error);
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error("Error boundary name: ", this.props.boundaryName);
    console.error("Did catch error: ", error);
    console.error("error info: ", errorInfo);

    // do some logging to an error catching service!
    const errorMessage = String(error) + " - " + String(errorInfo);
    console.error(this.props.boundaryName, errorMessage);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {this.props.text ??
                `Es ist etwas schief gelaufen. (${this.props.boundaryName})`}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
