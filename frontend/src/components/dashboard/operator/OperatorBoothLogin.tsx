import { CameraIcon, QrCodeIcon } from "lucide-react";

interface OperatorBoothLoginProps {
  scannerOpen: boolean;
  scanError: string | null;
  qrInput: string;
  onInputChange: (value: string) => void;
  onScanSubmit: () => void;
  onStartScanner: () => void;
  onStopScanner: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function OperatorBoothLogin({
  scannerOpen,
  scanError,
  qrInput,
  onInputChange,
  onScanSubmit,
  onStartScanner,
  onStopScanner,
  videoRef,
}: OperatorBoothLoginProps) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">Booth Login via QR</h2>
      <p className="mt-1 text-sm text-gray-600">
        Scan a booth QR code to start operator actions for that booth.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onStartScanner}
          disabled={scannerOpen}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-70"
        >
          <CameraIcon className="h-4 w-4" />
          {scannerOpen ? "Scanner Active" : "Start Camera Scan"}
        </button>
        {scannerOpen && (
          <button
            type="button"
            onClick={onStopScanner}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Stop Scanner
          </button>
        )}
      </div>

      {scannerOpen && (
        <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-black">
          <video ref={videoRef} className="h-64 w-full object-cover" muted playsInline autoPlay />
        </div>
      )}

      <div className="mt-4">
        <label htmlFor="operatorQrInput" className="text-sm font-medium text-gray-700">
          Manual Booth QR Value
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="operatorQrInput"
            value={qrInput}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Enter booth id or booth name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={onScanSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <QrCodeIcon className="h-4 w-4" />
            Login Booth
          </button>
        </div>
      </div>

      {scanError && <p className="mt-3 text-sm text-rose-600">{scanError}</p>}
    </article>
  );
}
