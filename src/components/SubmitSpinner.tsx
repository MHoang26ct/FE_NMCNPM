import { useEffect, useState } from "react";

interface SubmitSpinnerProps {
  open: boolean;
  onDone: () => void;
  message?: string;
}

/**
 * Shows a full-screen spinner overlay for 2 seconds, then calls onDone.
 * Mount it while `open` is true; the parent should hide it after onDone fires.
 */
export function SubmitSpinner({
  open,
  onDone,
  message = "Đã gửi yêu cầu về hệ thống, vui lòng chờ trong giây lát...",
}: SubmitSpinnerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      {/* Spinner ring */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-base font-medium text-foreground text-center max-w-xs px-4">{message}</p>
    </div>
  );
}
