import {
    ActionIcon,
    Tooltip
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconQrcode, IconQrcodeOff, IconX } from "@tabler/icons-react";
import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";
import Scanner, { ScanResults, State } from "./Scanner";

const MODAL_ID = "qr-scanner";

export default function QrButton({
  onResult,
}: {
  onResult: (result: ScanResults) => void;
}) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [scanning, setScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const mediaMatch = useMediaQuery("(min-width: 62em)");
  const qrScanner = useRef(null);

  useEffect(() => {
    QrScanner.hasCamera()
      .then(
        (value) => setHasCamera(value),
        () => setHasCamera(false)
      )
      .catch(() => setHasCamera(false));
  }, []);

  const openScanner = () => {
    modals.open({
      modalId: MODAL_ID,
      size: "calc(100vw - 3 rem)",
      children: (
        <Scanner
          startOnLoad
          hideButton
          onResult={(result) => {
            console.log("Found result: %s", result.data);
            modals.close(MODAL_ID);
            onResult(result);
          }}
          onStateChanged={(state) => {
            switch (state) {
              case State.Rejected:
              case State.Failed:
                modals.close(MODAL_ID);
                break;
            }
          }}
          onError={(e) => {
            e &&
              notifications.show({
                title: "Scan Error",
                message: e,
                color: "red",
                icon: <IconX />,
              });
          }}
        />
      ),
      centered: true,
    });
  };

  return (
    <>
      <Tooltip label={hasCamera ? "Scan QR Code" : "No Camera"}>
        <ActionIcon
          size="input-sm"
          disabled={!hasCamera}
          onClick={() => {
            openScanner();
            setScanning(!scanning);
          }}
          variant="outline"
          style={{ justifySelf: "flex-end", alignSelf: "flex-end" }}
        >
          {!hasCamera ? <IconQrcodeOff /> : <IconQrcode />}
        </ActionIcon>
      </Tooltip>
    </>
  );
}
