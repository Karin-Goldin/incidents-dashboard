import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";

interface ErrorBannerProps {
  error: string;
  onRetry: () => void;
  onDismiss?: () => void;
}

export default function ErrorBanner({
  error,
  onRetry,
  onDismiss,
}: ErrorBannerProps) {
  return (
    <Card className="mb-4 border-danger bg-danger-50 dark:bg-danger-950">
      <CardBody className="flex flex-row items-center justify-between gap-4 py-3">
        <div className="flex-1">
          <p className="text-danger font-semibold">Error</p>
          <p className="text-danger-700 dark:text-danger-300 text-sm">
            {error}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            color="danger"
            variant="solid"
            size="sm"
            onPress={onRetry}
            className="font-semibold"
          >
            Retry
          </Button>
          {onDismiss && (
            <Button
              color="default"
              variant="light"
              size="sm"
              onPress={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
