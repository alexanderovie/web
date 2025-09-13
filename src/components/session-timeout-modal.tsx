import { IconClock, IconAlertTriangle, IconLogout } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  timeRemaining: string;
  onKeepSession: () => void;
  onLogout: () => void;
}

export function SessionTimeoutModal({
  isOpen,
  timeRemaining,
  onKeepSession,
  onLogout,
}: SessionTimeoutModalProps) {
  const t = useTranslations("SessionTimeout");

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <IconAlertTriangle className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <IconClock className="h-4 w-4" />
            <AlertDescription>{t("description")}</AlertDescription>
          </Alert>

          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {timeRemaining}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("timeRemaining")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onKeepSession}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {t("keepSession")}
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <IconLogout className="h-4 w-4 mr-2" />
              {t("logout")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
