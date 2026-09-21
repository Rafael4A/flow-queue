import {
  Alert,
  AlertTitle,
  Snackbar,
  type AlertProps,
  type SnackbarOrigin,
  type SnackbarProps,
} from "@mui/material";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";

const DEFAULT_AUTO_HIDE = 5000;
const DEFAULT_ANCHOR_ORIGIN: SnackbarOrigin = {
  vertical: "top",
  horizontal: "center",
};

export interface SnackAlertParams
  extends
    Pick<SnackbarProps, "anchorOrigin" | "autoHideDuration">,
    Pick<AlertProps, "icon" | "variant" | "severity"> {
  content: ReactNode;
  title?: ReactNode;
}

interface SnackAlertContext {
  openAlert: (params: SnackAlertParams) => void;
  dismissAlert: () => void;
}

const SnackAlertContext = createContext<SnackAlertContext>(
  {} as SnackAlertContext,
);

//eslint-disable-next-line react-refresh/only-export-components
export function useSnackAlert(): SnackAlertContext {
  return useContext(SnackAlertContext);
}

export function SnackAlertProvider({ children }: Readonly<PropsWithChildren>) {
  const [visible, setVisible] = useState(false);

  const [autoHideDuration, setAutoHideDuration] = useState<number | null>();

  const [params, setParams] = useState<SnackAlertParams>();

  const openAlert = (alertParams: SnackAlertParams) => {
    setVisible(true);
    const timeout = alertParams?.autoHideDuration ?? DEFAULT_AUTO_HIDE;
    setAutoHideDuration(
      alertParams?.autoHideDuration === null ? null : timeout,
    );
    setParams(alertParams);
  };

  const dismissAlert = () => {
    setAutoHideDuration(undefined);
    setVisible(false);
  };

  const value = useMemo(
    () => ({
      dismissAlert,
      openAlert,
    }),
    [],
  );

  return (
    <SnackAlertContext value={value}>
      {children}
      <Snackbar
        open={visible}
        autoHideDuration={autoHideDuration}
        onClose={dismissAlert}
        anchorOrigin={params?.anchorOrigin ?? DEFAULT_ANCHOR_ORIGIN}
      >
        <Alert
          onClose={dismissAlert}
          variant={params?.variant ?? "filled"}
          severity={params?.severity ?? "info"}
          icon={params?.icon}
          elevation={24}
          sx={(theme) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          })}
        >
          {!!params?.title && <AlertTitle>{params?.title}</AlertTitle>}
          {params?.content}
        </Alert>
      </Snackbar>
    </SnackAlertContext>
  );
}
