/**
 * QRCodeWithComponent
 *
 * A layout component that combines QR code display with other content
 * in a horizontal flex arrangement. Provides conditional QR code rendering
 * and content positioning.
 *
 *
 * @module QRCodeWithComponent
 *
 * @author Kyle Dunn
 */

import { Flex } from "@mantine/core";
import QRCodePreview, { QRCodePreviewProps } from "./QRCodePreview";

/**
 * Props for the QRCodeWithComponent
 */
export interface QRCodeWithComponentProps extends QRCodePreviewProps {
  /** Whether to show the QR code */
  showQRCode?: boolean;
  /** Child components to render alongside QR code */
  children: React.ReactNode;
}

/**
 * A layout component combining QR code preview with other content
 * Arranges QR code and children in a horizontal flex layout
 *
 * @param props - The component props
 * @returns The rendered QR code with component layout
 */
export function QRCodeWithComponent({
  qrCode,
  showQRCode = true,
  scale,
  alt,
  children,
}: QRCodeWithComponentProps) {
  return (
    <Flex w="100%" direction="row" align="center" wrap="nowrap" gap="sm">
      {/* Conditionally render QR code based on settings and data availability */}
      {(showQRCode || (!showQRCode && qrCode !== undefined)) && (
        <QRCodePreview qrCode={qrCode} scale={scale} alt={alt} />
      )}
      {children}
    </Flex>
  );
}
