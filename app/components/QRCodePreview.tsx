import { Box, Center, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import QRCodeView from "./QRCodeView";

export interface QRCodePreviewProps {
  qrCode: string;
  previewOpened?: boolean;
  scale?: number;
}

export default function QRCodePreview({ qrCode, scale = 1.5 }: QRCodePreviewProps) {
  const [previewOpened, { open: previewOpen, close: previewClose }] =
    useDisclosure(false);

  return (
    <>
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

      <Box onClick={() => previewOpen()} style={{ cursor: "pointer" }}>
        <QRCodeView qrCode={qrCode} scale={scale} />
      </Box>
    </>
  );
}
