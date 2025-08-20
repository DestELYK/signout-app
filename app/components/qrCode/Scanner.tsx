/**
 * Scanner Component
 *
 * A QR code scanner component that provides real-time
 * QR code detection using device cameras. Includes state management,
 * error handling, and configurable scanning behavior.
 *
 *
 * @module Scanner
 *
 * @author Kyle Dunn
 */

import { Center } from "@mantine/core";
import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

/**
 * Scanner state enumeration
 */
export enum State {
  Stopped,
  Starting,
  Scanning,
  Paused,
  Resuming,
  Failed,
  Rejected,
}

/**
 * Scan result data structure
 */
export type ScanResults = {
  /** The decoded QR code data */
  data: string;
  /** Corner points of the detected QR code */
  cornerPoints: [{ x: number; y: number }];
  /** Timestamp when the code was detected */
  time: Date;
};

/** Camera availability check */
export const hasCamera = QrScanner.hasCamera();

/**
 * Props for the Scanner component
 */
interface ScannerProps {
  /** Whether to stop scanning after first detection */
  stopOnDetection?: boolean | false;
  /** Whether to hide control buttons */
  hideButton?: boolean | false;
  /** Whether to start scanning on component load */
  startOnLoad?: boolean | false;
  /** Callback fired when scanner state changes */
  onStateChanged?: (state: State) => void;
  /** Callback fired when QR code is detected */
  onResult?: (result: ScanResults) => void;
  /** Callback fired when scanner encounters errors */
  onError?: (reason: any) => void;
}

/**
 * A comprehensive QR code scanner component with state management
 * Provides real-time QR code detection with configurable behavior
 *
 * @param props - The component props
 * @returns The rendered scanner component
 */
export default function Scanner({
  stopOnDetection,
  hideButton,
  startOnLoad,
  onStateChanged,
  onResult,
  onError,
}: ScannerProps) {
  // Component state
  const [result, setResult] = useState<ScanResults>();
  const [state, setState] = useState<State>(State.Stopped);

  // Refs for video element and scanner instance
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  // Initialize scanner on component mount
  useEffect(() => {
    if (scannerRef.current == null) {
      scannerRef.current = new QrScanner(
        // @ts-ignore
        videoRef.current,
        // @ts-ignore
        (result) => {
          // Enhance result with timestamp
          result = {
            ...result,
            time: new Date(),
          };

          // Stop scanning if configured to do so
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

    // Cleanup scanner on unmount
    return () => {
      scannerRef.current!.destroy();
      scannerRef.current = null;
    };
  }, [stopOnDetection]);

  /**
   * Update scanner state and notify listeners
   * @param newState - The new state to set
   */
  function updateState(newState: State) {
    if (state != newState) {
      setState(newState);
      onStateChanged?.(newState);
    }
  }

  /**
   * Start the QR code scanner
   * Handles initialization and error states
   */
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

  /**
   * Pause the scanner video stream
   */
  function pauseScanner() {
    if (state != State.Scanning) return;

    scannerRef.current?.$video.pause();
    updateState(State.Paused);
  }

  /**
   * Resume the scanner video stream
   */
  function resumeScanner() {
    if (state != State.Paused) return;

    scannerRef.current?.$video.play();
    updateState(State.Scanning);
  }

  /**
   * Stop the scanner and cleanup resources
   */
  function stopScanner() {
    scannerRef.current?.stop();
    updateState(State.Stopped);
  }

  // Auto-start scanner if configured
  useEffect(() => {
    if (startOnLoad) {
      startScanner();
    }
  }, [startOnLoad]);

  return (
    <Center w="100%" h="100%">
      <video
        ref={videoRef}
        style={{ objectFit: "scale-down", maxWidth: "100%", maxHeight: "100%" }}
      />
    </Center>
  );
}
