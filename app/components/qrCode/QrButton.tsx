/**
 * QrButton Component
 *
 * A button component that provides QR code scanning functionality
 * through a modal interface. Includes camera detection, error handling,
 * and user-friendly feedback.
 *
 *
 * @module QrButton
 *
 * @author Kyle Dunn
 */

import { ActionIcon, Modal, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconQrcode, IconQrcodeOff, IconX } from "@tabler/icons-react";
import QrScanner from "qr-scanner";
import { useEffect, useState } from "react";
import Scanner, { ScanResults, State } from "./Scanner";

/** Unique identifier for the QR scanner modal */
const MODAL_ID = "qr-scanner";

/**
 * Props for the QrButton component
 */
interface QrButtonProps {
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Callback fired when a QR code is successfully scanned */
  onResult: (result: ScanResults) => void;
}

/**
 * A button component for initiating QR code scanning
 * Provides camera detection and modal scanner interface
 *
 * @param props - The component props
 * @returns The rendered QR button component
 */
export default function QrButton({ disabled, onResult }: QrButtonProps) {
  // Modal state for scanner interface
  const [opened, { open, close }] = useDisclosure(false);
  // Camera availability state
  const [hasCamera, setHasCamera] = useState(false);

  // Check for camera availability on component mount
  useEffect(() => {
    QrScanner.hasCamera()
      .then(
        (value) => setHasCamera(value),
        () => setHasCamera(false)
      )
      .catch(() => setHasCamera(false));
  }, []);

  return (
    <>
      {/* Full-screen scanner modal */}
      <Modal centered fullScreen opened={opened} onClose={close}>
        <Scanner
          startOnLoad
          hideButton
          onResult={(result) => {
            close();
            onResult(result);
          }}
          onStateChanged={(state) => {
            // Close modal on scanner failure or rejection
            switch (state) {
              case State.Rejected:
              case State.Failed:
                close();
                break;
            }
          }}
          onError={(e) => {
            // Show error notifications for scan failures
            e &&
              notifications.show({
                title: "Scan Error",
                message: e,
                color: "red",
                icon: <IconX />,
              });
          }}
        />
      </Modal>

      {/* QR button with tooltip feedback */}
      <Tooltip label={hasCamera ? "Scan QR Code" : "No Camera"}>
        <ActionIcon
          size="input-sm"
          tabIndex={-1}
          disabled={disabled || !hasCamera}
          onClick={() => {
            open();
          }}
          variant="outline"
          style={{ justifySelf: "flex-end", alignSelf: "flex-end" }}
        >
          {disabled || !hasCamera ? <IconQrcodeOff /> : <IconQrcode />}
        </ActionIcon>
      </Tooltip>
    </>
  );
}
