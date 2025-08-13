import { Box, Center, Modal, Paper, Popover, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import QRCodeView, { QR_WIDTH } from "./QRCodeView";

export interface QRCodePreviewProps {
    qrCode?: string | null;
    previewOpened?: boolean;
    scale?: number;
    type?: "modal" | "hover";
    alt?: string;
}

export default function QRCodePreview({
    qrCode,
    scale = 1.5,
    type = "modal",
    alt = "No QRCode",
}: QRCodePreviewProps) {
    const [previewOpened, { open: previewOpen, close: previewClose }] = useDisclosure(false);
    const [popoverOpened, { open: popoverOpen, close: popoverClose }] = useDisclosure(false);

    return (
        <>
            {qrCode && type === "modal" && (
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
