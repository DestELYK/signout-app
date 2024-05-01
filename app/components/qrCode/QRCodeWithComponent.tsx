import { Flex } from "@mantine/core";
import QRCodePreview, { QRCodePreviewProps } from "./QRCodePreview";

export interface QRCodeWithComponentProps extends QRCodePreviewProps {
  children: React.ReactNode;
}

export function QRCodeWithComponent({
  qrCode,
  scale,
  children,
}: QRCodeWithComponentProps) {
  return (
    <Flex direction="row" align="center" wrap="nowrap" gap="sm">
      <QRCodePreview qrCode={qrCode} scale={scale} />
      {children}
    </Flex>
  );
}
