import { Box, Center, Modal, Paper, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import QRCodeView, { QR_WIDTH } from "./QRCodeView";

export interface QRCodePreviewProps {
  qrCode?: string | null;
  previewOpened?: boolean;
  scale?: number;
}

export default function QRCodePreview({
  qrCode,
  scale = 1.5,
}: QRCodePreviewProps) {
  const [previewOpened, { open: previewOpen, close: previewClose }] =
    useDisclosure(false);

  return (
    <>
      {qrCode && (
        <Modal
          opened={previewOpened}
          onClose={previewClose}
          centered
          withCloseButton={false}
        >
          <Center w="100%" h="100%">
            <QRCodeView qrCode={qrCode} scale={10} showText showDownload />
          </Center>
        </Modal>
      )}

      <Box
        onClick={() => qrCode && previewOpen()}
        style={{ cursor: "pointer" }}
      >
        <Paper
          withBorder
          w={`${QR_WIDTH * scale}px`}
          h={`${QR_WIDTH * scale}px`}
        >
          {qrCode ? (
            <QRCodeView qrCode={qrCode} scale={scale} />
          ) : (
            <Center h="100%">
              <Text ta="center" size="xs">
                No QRCode
              </Text>
            </Center>
          )}
        </Paper>
      </Box>
    </>
  );
}
