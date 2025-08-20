/**
 * QRCodePreview Component
 *
 * A preview component for displaying QR codes with interactive functionality.
 * Supports both modal and hover preview modes for user experience.
 *
 *
 * @module QRCodePreview
 *
 * @author Kyle Dunn
 */

import { Box, Center, Modal, Paper, Popover, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import QRCodeView, { QR_WIDTH } from "./QRCodeView";

/**
 * Props for the QRCodePreview component
 */
export interface QRCodePreviewProps {
  /** The QR code data string */
  qrCode?: string | null;
  /** Whether preview is opened (controlled) */
  previewOpened?: boolean;
  /** Scale factor for QR code display */
  scale?: number;
  /** Interaction type - modal or hover */
  type?: "modal" | "hover";
  /** Alternative text when QR code is not available */
  alt?: string;
}

/**
 * A preview component for interactive QR code display
 * Provides modal and hover interactions for enhanced QR code viewing
 *
 * @param props - The component props
 * @returns The rendered QR code preview component
 */
export default function QRCodePreview({
  qrCode,
  scale = 1.5,
  type = "modal",
  alt = "No QRCode",
}: QRCodePreviewProps) {
  // Modal state for enlarged QR code display
  const [previewOpened, { open: previewOpen, close: previewClose }] = useDisclosure(false);
  // Popover state for hover interactions
  const [popoverOpened, { open: popoverOpen, close: popoverClose }] = useDisclosure(false);

  return (
    <>
      {/* Modal preview for enlarged QR code display */}
      {qrCode && type === "modal" && (
        <Modal opened={previewOpened} onClose={previewClose} centered withCloseButton={false}>
          <Center w="100%" h="100%">
            <QRCodeView qrCode={qrCode} scale={10} showText showDownload />
          </Center>
        </Modal>
      )}

      {/* Main QR code container with interaction handling */}
      <Box
        {...(qrCode &&
          type === "modal" && {
            onClick: (event) => {
              event.stopPropagation();
              previewOpen();
            },
            style: { cursor: "pointer" },
          })}
      >
        <Paper withBorder w={`${QR_WIDTH * scale}px`} h={`${QR_WIDTH * scale}px`}>
          {qrCode ? (
            type === "modal" ? (
              <QRCodeView qrCode={qrCode} scale={scale} hidden={previewOpened} />
            ) : (
              // Hover popover interaction
              type === "hover" && (
                <Popover
                  position="bottom"
                  withArrow
                  arrowSize={24}
                  shadow="lg"
                  opened={popoverOpened}
                >
                  <Popover.Target>
                    <Box onMouseEnter={popoverOpen} onMouseLeave={popoverClose}>
                      <QRCodeView qrCode={qrCode} scale={scale} />
                    </Box>
                  </Popover.Target>

                  <Popover.Dropdown style={{ pointerEvents: "none" }}>
                    <QRCodeView qrCode={qrCode} scale={scale * 5} showText />
                  </Popover.Dropdown>
                </Popover>
              )
            )
          ) : (
            // Fallback display when no QR code is available
            <Center h="100%">
              <Text ta="center" size="xs">
                {alt}
              </Text>
            </Center>
          )}
        </Paper>
      </Box>
    </>
  );
}
