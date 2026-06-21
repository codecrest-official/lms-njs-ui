import { DoorOpenIcon, QrCodeIcon, ShieldCheckIcon } from "lucide-react";
import type { RefObject } from "react";
import type { UserBooth } from "./types";

interface AccessTabProps {
  scannerOpen: boolean;
  authenticatingBooth: boolean;
  accessError: string | null;
  accessMessage: string | null;
  lastScannedBooth: UserBooth | null;
  lastScannedQr: string;
  isDoorOpen: boolean;
  doorOpenSeconds: number;
  accessGranted: boolean | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  onStartScanner: () => void;
  onStopScanner: () => void;
}

export function AccessTab({
  scannerOpen,
  authenticatingBooth,
  accessError,
  accessMessage,
  lastScannedBooth,
  lastScannedQr,
  isDoorOpen,
  doorOpenSeconds,
  accessGranted,
  videoRef,
  onStartScanner,
  onStopScanner,
}: AccessTabProps) {
  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center gap-2">
          <QrCodeIcon className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Booth QR Authentication</h2>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Open scanner, point to the booth QR, and access will be validated automatically using your login.
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onStartScanner}
              disabled={scannerOpen || authenticatingBooth}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              <QrCodeIcon className="h-4 w-4" />
              {scannerOpen ? "Scanner Active" : "Open QR Scanner"}
            </button>
            {scannerOpen && (
              <button
                type="button"
                onClick={onStopScanner}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
              >
                Stop Scanner
              </button>
            )}
          </div>

          {scannerOpen && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-black">
              <video ref={videoRef} className="h-64 w-full object-cover" muted playsInline autoPlay />
            </div>
          )}

          {authenticatingBooth && (
            <p className="inline-flex items-center gap-2 text-sm text-indigo-700">
              <ShieldCheckIcon className="h-4 w-4" />
              Authenticating scanned booth and user access...
            </p>
          )}

          {accessError && <p className="text-sm text-rose-600">{accessError}</p>}
          {accessMessage && <p className="text-sm text-emerald-700">{accessMessage}</p>}
        </div>
      </article>

      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Booth Door Status</h3>
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Last scanned booth</p>
          <p className="font-semibold text-gray-800">{lastScannedBooth ? lastScannedBooth.name : "No booth scanned yet"}</p>
          <p className="text-xs text-gray-500">{lastScannedBooth?.locationName ?? "Scan booth QR to identify location"}</p>
          {lastScannedQr && <p className="mt-2 text-xs text-gray-500">Last QR: {lastScannedQr}</p>}
        </div>

        <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex items-center gap-2">
            <DoorOpenIcon className="h-5 w-5 text-indigo-700" />
            <p className="font-semibold text-indigo-900">Electromagnetic Door</p>
          </div>
          <p className="mt-2 text-sm text-indigo-800">
            {isDoorOpen
              ? `Door is OPEN. It will auto-lock in ${doorOpenSeconds}s.`
              : accessGranted === false
                ? "Door remains locked due to failed access checks."
                : "Door is locked. Scan booth QR to authenticate and open."}
          </p>
        </div>
      </article>
    </section>
  );
}
