import { LogOutIcon, QrCodeIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { BoothBook, UserBooth } from "@/components/dashboard/user/types";
import { OperatorBoothLogin } from "./OperatorBoothLogin";
import { OperatorBoothManager } from "./OperatorBoothManager";

interface OperatorDashboardProps {
  booths: UserBooth[];
  boothBooks: Record<number, BoothBook[]>;
  onAddBook: (boothId: number, title: string, author: string, availableCopies: number) => void;
  onRemoveBook: (boothId: number, bookId: number) => void;
  onUpdateBoothStatus: (boothId: number, status: UserBooth["status"]) => void;
  onLogout: () => void;
}

function parseBoothFromQr(qrValue: string, booths: UserBooth[]): UserBooth | null {
  const parsedId = Number.parseInt(qrValue, 10);
  if (!Number.isNaN(parsedId)) {
    return booths.find((booth) => booth.id === parsedId) ?? null;
  }

  const normalized = qrValue.toLowerCase();
  return booths.find((booth) => normalized.includes(booth.name.toLowerCase())) ?? null;
}

export function OperatorDashboard({
  booths,
  boothBooks,
  onAddBook,
  onRemoveBook,
  onUpdateBoothStatus,
  onLogout,
}: OperatorDashboardProps) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [qrInput, setQrInput] = useState("");
  const [activeBoothId, setActiveBoothId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", author: "", availableCopies: 1 });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const activeBooth = booths.find((booth) => booth.id === activeBoothId) ?? null;
  const activeBoothBooks = activeBoothId ? boothBooks[activeBoothId] ?? [] : [];

  const stopScanner = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScannerOpen(false);
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const handleQrLogin = (value: string) => {
    const matched = parseBoothFromQr(value, booths);
    if (!matched) {
      setScanError("Invalid booth QR. Please scan a valid booth QR code.");
      return;
    }

    setScanError(null);
    setActiveBoothId(matched.id);
    setQrInput("");
  };

  const startScanner = async () => {
    try {
      setScanError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScannerOpen(true);

      const detector =
        "BarcodeDetector" in window
          ? new (
              window as {
                BarcodeDetector: new (options: { formats: string[] }) => {
                  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
                };
              }
            ).BarcodeDetector({ formats: ["qr_code"] })
          : null;

      const poll = async () => {
        if (!videoRef.current || !scannerOpen) return;
        try {
          if (detector) {
            const barcodes = await detector.detect(videoRef.current);
            const qr = barcodes[0]?.rawValue;
            if (qr) {
              handleQrLogin(qr);
              stopScanner();
              return;
            }
          }
        } catch {
          // ignore intermittent frame-level errors
        }

        timerRef.current = window.setTimeout(() => {
          void poll();
        }, 500);
      };

      void poll();
    } catch {
      setScanError("Unable to access camera. Please check browser permissions.");
      stopScanner();
    }
  };

  const onManualSubmit = () => {
    if (!qrInput.trim()) {
      setScanError("Enter a booth id or booth name.");
      return;
    }
    handleQrLogin(qrInput.trim());
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-600">Operator Console</p>
              <h1 className="text-2xl font-bold text-gray-900">Booth Inventory & Status Management</h1>
              <p className="text-sm text-gray-600">Scan booth QR to login, manage books, and update booth health.</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 self-start rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <LogOutIcon className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <OperatorBoothLogin
          scannerOpen={scannerOpen}
          scanError={scanError}
          qrInput={qrInput}
          onInputChange={setQrInput}
          onScanSubmit={onManualSubmit}
          onStartScanner={startScanner}
          onStopScanner={stopScanner}
          videoRef={videoRef}
        />

        {activeBooth ? (
          <OperatorBoothManager
            booth={activeBooth}
            books={activeBoothBooks}
            form={form}
            onFormChange={setForm}
            onAddBook={() => {
              if (!form.title.trim() || !form.author.trim()) {
                setScanError("Book title and author are required.");
                return;
              }
              setScanError(null);
              onAddBook(activeBooth.id, form.title.trim(), form.author.trim(), form.availableCopies);
              setForm({ title: "", author: "", availableCopies: 1 });
            }}
            onRemoveBook={(bookId) => onRemoveBook(activeBooth.id, bookId)}
            onUpdateStatus={(status) => onUpdateBoothStatus(activeBooth.id, status)}
          />
        ) : (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-600 shadow-sm ring-1 ring-gray-200">
            <QrCodeIcon className="mx-auto mb-2 h-8 w-8 text-indigo-500" />
            Scan a booth QR to load booth management controls.
          </div>
        )}
      </div>
    </main>
  );
}
