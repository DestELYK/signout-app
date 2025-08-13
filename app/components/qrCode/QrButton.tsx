import { ActionIcon, Modal, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconQrcode, IconQrcodeOff, IconX } from "@tabler/icons-react";
import QrScanner from "qr-scanner";
import { useEffect, useState } from "react";
import Scanner, { ScanResults, State } from "./Scanner";

const MODAL_ID = "qr-scanner";

export default function QrButton({
    disabled,
    onResult,
}: {
    disabled?: boolean;
    onResult: (result: ScanResults) => void;
}) {
    const [opened, { open, close }] = useDisclosure(false);
    const [hasCamera, setHasCamera] = useState(false);

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
            <Modal centered fullScreen opened={opened} onClose={close}>
                <Scanner
                    startOnLoad
                    hideButton
                    onResult={(result) => {
                        close();
                        onResult(result);
                    }}
                    onStateChanged={(state) => {
                        switch (state) {
                            case State.Rejected:
                            case State.Failed:
                                close();
                                break;
                        }
                    }}
                    onError={(e) => {
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
