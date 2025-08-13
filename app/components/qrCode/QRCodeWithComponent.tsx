import { Flex } from "@mantine/core";
import QRCodePreview, { QRCodePreviewProps } from "./QRCodePreview";

export interface QRCodeWithComponentProps extends QRCodePreviewProps {
    showQRCode?: boolean;
    children: React.ReactNode;
}

export function QRCodeWithComponent({
    qrCode,
    showQRCode = true,
    scale,
    alt,
    children,
}: QRCodeWithComponentProps) {
    return (
        <Flex w="100%" direction="row" align="center" wrap="nowrap" gap="sm">
            {(showQRCode || (!showQRCode && qrCode !== undefined)) && (
                <QRCodePreview qrCode={qrCode} scale={scale} alt={alt} />
            )}
            {children}
        </Flex>
    );
}
