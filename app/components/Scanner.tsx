import { Center } from "@mantine/core";
import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

export enum State {
  Stopped,
  Starting,
  Scanning,
  Paused,
  Resuming,
  Failed,
  Rejected,
}

export type ScanResults = {
  data: string;
  cornerPoints: [{ x: number; y: number }];
  time: Date;
};

export const hasCamera = QrScanner.hasCamera();

export default function Scanner({
  stopOnDetection,
  hideButton,
  startOnLoad,
  onStateChanged,
  onResult,
  onError,
}: {
  stopOnDetection?: boolean | false;
  hideButton?: boolean | false;
  startOnLoad?: boolean | false;
  onStateChanged?: (state: State) => void;
  onResult?: (result: ScanResults) => void;
  onError?: (reason: any) => void;
}) {
  const [result, setResult] = useState<ScanResults>();
  const [state, setState] = useState<State>(State.Stopped);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (scannerRef.current == null) {
      scannerRef.current = new QrScanner(
        // @ts-ignore
        videoRef.current,
        // @ts-ignore
        (result) => {
          result = {
            ...result,
            time: new Date(),
          };

          console.log(result);

          if (stopOnDetection) {
            pauseScanner();
          }

          setResult(result);
          onResult?.(result);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 2,
          preferredCamera: "environment",
        }
      );
    }

    return () => {
      scannerRef.current!.destroy();
      scannerRef.current = null;
    };
  }, [stopOnDetection]);

  function updateState(newState: State) {
    if (state != newState) {
      console.log(`Switched to ${State[newState]}`);
      setState(newState);
      onStateChanged?.(newState);
    }
  }

  function startScanner() {
    if (state != State.Stopped) return;

    updateState(State.Starting);
    scannerRef.current
      ?.start()
      .then(
        () => {
          updateState(State.Scanning);
        },
        (e) => {
          console.warn("Failed to start scanner: %s", e);
          onError?.(e);
          updateState(State.Failed);
          stopScanner();
        }
      )
      .catch((e) => {
        console.warn("Failed to start scanner: %s", e);
        onError?.(e);
        updateState(State.Failed);
        stopScanner();
      });
  }

  function pauseScanner() {
    console.log(State[state]);

    if (state != State.Scanning) return;

    scannerRef.current?.$video.pause();
    updateState(State.Paused);
  }

  function resumeScanner() {
    if (state != State.Paused) return;

    scannerRef.current?.$video.play();
    updateState(State.Scanning);
  }

  function stopScanner() {
    scannerRef.current?.stop();
    updateState(State.Stopped);
  }

  useEffect(() => {
    if (startOnLoad) {
      startScanner();
    }
  }, [startOnLoad]);

  return (
    <Center w="100%" h="100%">
      <video
        ref={videoRef}
        style={{ objectFit: "scale-down", maxWidth: "100%", maxHeight: "100%"}}
      />
    </Center>
  );
}
