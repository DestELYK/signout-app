import { ActionIcon, Box, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDownload } from "@tabler/icons-react";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";

export const QR_WIDTH = 30;

export interface QRCodeViewProps {
    qrCode?: string | null;
    scale?: number;
    showText?: boolean;
    showDownload?: boolean;
    hidden?: boolean;
}

export default function QRCodeView({
    qrCode,
    scale = 1,
    showText = false,
    showDownload = false,
    hidden = false,
}: QRCodeViewProps) {
    const qrCodeRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (qrCode) {
            QRCode.toCanvas(qrCodeRef.current, qrCode, {
                scale: scale,
                margin: 0,
                width: scale * QR_WIDTH,
            });
        }
    }, [qrCode, qrCodeRef, scale]);

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
            {showDownload && (
                <ActionIcon
                    variant="subtle"
                    pos="absolute"
                    top={10}
                    right={10}
                    onClick={() => download()}
                >
                    <IconDownload />
                </ActionIcon>
            )}
            <Stack align="center">
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

                <Text size="sm" hidden={!showText}>
                    {qrCode}
                </Text>
            </Stack>
        </>
    );
}
