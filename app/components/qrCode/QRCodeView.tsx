/**
 * QRCodeView Component
 *
 * A QR code display component that renders QR codes with
 * customizable scaling, text display, and download functionality.
 *
 *
 * @module QRCodeView
 *
 * @author Kyle Dunn
 */

import { ActionIcon, Box, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDownload } from "@tabler/icons-react";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";

/** Standard QR code width in pixels */
export const QR_WIDTH = 30;

/**
 * Props for the QRCodeView component
 */
export interface QRCodeViewProps {
  /** The data string to encode in the QR code */
  qrCode?: string | null;
  /** Scale factor for QR code size */
  scale?: number;
  /** Whether to show the encoded text below the QR code */
  showText?: boolean;
  /** Whether to show the download button */
  showDownload?: boolean;
  /** Whether to hide the QR code with overlay */
  hidden?: boolean;
}

/**
 * A versatile QR code display component with customizable features
 * Renders QR codes with scaling, text display, and download options
 *
 * @param props - The component props
 * @returns The rendered QR code view component
 */
export default function QRCodeView({
  qrCode,
  scale = 1,
  showText = false,
  showDownload = false,
  hidden = false,
}: QRCodeViewProps) {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code on canvas when data changes
  useEffect(() => {
    if (qrCode) {
      QRCode.toCanvas(qrCodeRef.current, qrCode, {
        scale: scale,
        margin: 0,
        width: scale * QR_WIDTH,
      });
    }
  }, [qrCode, qrCodeRef, scale]);

  /**
   * Download the QR code as a PNG image
   * Creates a download link with the canvas data
   */
  function download() {
    if (qrCodeRef.current) {
      const url = qrCodeRef.current?.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${qrCode}.png`;
      link.href = url;
      link.click();
    } else {
      notifications.show({
        message: "Failed to download qrCode",
        color: "error",
      });
    }
  }

  return (
    <>
      {/* Download button overlay */}
      {showDownload && (
        <ActionIcon variant="subtle" pos="absolute" top={10} right={10} onClick={() => download()}>
          <IconDownload />
        </ActionIcon>
      )}
      <Stack align="center">
        {/* QR code canvas container with optional overlay */}
        <Box pos="relative" w={QR_WIDTH * scale} h={QR_WIDTH * scale}>
          <Box
            pos="absolute"
            top={0}
            bottom={0}
            left={0}
            right={0}
            hidden={!hidden}
            w="100%"
            h="100%"
            bg="gray"
          />
          <canvas ref={qrCodeRef} />
        </Box>

        {/* Optional text display */}
        <Text size="sm" hidden={!showText}>
          {qrCode}
        </Text>
      </Stack>
    </>
  );
}
