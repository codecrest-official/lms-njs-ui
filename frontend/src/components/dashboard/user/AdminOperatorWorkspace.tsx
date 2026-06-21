import clsx from "clsx";
import { CameraIcon, PlusCircleIcon, QrCodeIcon, Settings2Icon, Trash2Icon, LogOutIcon, WrenchIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { UserRole } from "@/types/auth";
import type { BoothBook, UserBooth } from "./types";

interface AdminOperatorWorkspaceProps {
  activeRole: UserRole;
  canSwitch: boolean;
  booths: UserBooth[];
  boothBooksByBoothId: Record<number, BoothBook[]>;
  onSwitchRole: (role: UserRole) => void;
  onSetBoothStatus: (boothId: number, status: UserBooth["status"]) => void;
  onAddBookToBooth: (boothId: number, title: string, author: string, availableCopies: number) => void;
  onRemoveBookFromBooth: (boothId: number, bookId: number) => void;
  onLogout: () => void;
}

function parseBoothFromQr(qrValue: string, booths: UserBooth[]): UserBooth | null {
  const parsedId = Number.parseInt(qrValue, 10);
  if (!Number.isNaN(parsedId)) {
    return booths.find((booth) => booth.id === parsedId) ?? null;
  }

  const normalized = qrValue.toLowerCase();
  return booths.find((booth) => normalized.includes(booth.name.toLowerCase()) || normalized.includes(booth.locationName.toLowerCase())) ?? null;
}

export function AdminOperatorWorkspace({
  activeRole,
  canSwitch,
  booths,
  boothBooksByBoothId,
  onSwitchRole,
  onSetBoothStatus,
  onAddBookToBooth,
  onRemoveBookFromBooth,
  onLogout,
}: AdminOperatorWorkspaceProps) {
  const [boothQrValue, setBoothQrValue] = useState("");
  const [operatorBoothId, setOperatorBoothId] = useState<number | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCopies, setNewCopies] = useState(1);
  const [scannerOpen, setScannerOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const selectedBooth = useMemo(
    () => booths.find((booth) => booth.id === operatorBoothId) ?? null,
    [booths, operatorBoothId]
  );
  const selectedBooks = selectedBooth ? boothBooksByBoothId[selectedBooth.id] ?? [] : [];

  const stopScanner = () => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
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

  const handleBoothQrLogin = () => {
    const scanned = parseBoothFromQr(boothQrValue.trim(), booths);
    if (!scanned) {
      setScanError("Booth not recognized. Scan a valid booth QR payload or booth ID.");
      return;
    }

    setOperatorBoothId(scanned.id);
    setBoothQrValue("");
    setScanError(null);
  };

  const startScanner = async () => {
    try {
      setScanError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScannerOpen(true);

      const detector = "BarcodeDetector" in window
        ? new (window as { BarcodeDetector: new (options: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector({ formats: ["qr_code"] })
        : null;

      const scanFrame = async () => {
        if (!videoRef.current || !scannerOpen) return;
        try {
          if (detector) {
            const barcodes = await detector.detect(videoRef.current);
            const qr = barcodes[0]?.rawValue;
            if (qr) {
              const scanned = parseBoothFromQr(qr, booths);
              if (scanned) {
                setOperatorBoothId(scanned.id);
                setScanError(null);
              } else {
                setScanError("Booth not recognized from scanned QR.");
              }
              stopScanner();
              return;
            }
          }
        } catch {
          // ignore frame-level camera scan errors
        }

        rafRef.current = window.setTimeout(() => {
          window.requestAnimationFrame(scanFrame);
        }, 500) as unknown as number;
      };

      window.requestAnimationFrame(scanFrame);
    } catch {
      setScanError("Unable to access camera. Please check browser permissions.");
      stopScanner();
    }
  };

  const isOperatorView = activeRole === "operator";

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-8 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <WrenchIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Admin / Operator Workspace</h1>
                <p className="text-xs text-indigo-100">Library Booth Management System</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/30"
            >
              <LogOutIcon className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="px-8 py-8">
          {isOperatorView ? (
            <div className="space-y-5">
              <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <QrCodeIcon className="h-5 w-5 text-indigo-700" />
                  <h2 className="text-lg font-semibold text-gray-800">Scan QR To Login To Booth</h2>
                </div>
                <p className="mt-1 text-sm text-gray-600">Use booth ID or booth name payload from QR scan.</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={startScanner}
                    disabled={scannerOpen}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
                  >
                    <CameraIcon className="h-4 w-4" />
                    {scannerOpen ? "Scanner Active" : "Start Camera Scan"}
                  </button>
                  {scannerOpen && (
                    <button
                      type="button"
                      onClick={stopScanner}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
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

                <div className="mt-4 flex flex-col gap-2 md:flex-row">
                  <input
                    type="text"
                    value={boothQrValue}
                    onChange={(event) => setBoothQrValue(event.target.value)}
                    placeholder="Enter scanned QR value"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <button
                    type="button"
                    onClick={handleBoothQrLogin}
                    className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    Login Booth
                  </button>
                </div>

                {scanError && <p className="mt-2 text-sm text-rose-600">{scanError}</p>}
                {selectedBooth && (
                  <p className="mt-2 text-sm text-emerald-700">
                    Logged in to booth: <span className="font-semibold">{selectedBooth.name}</span>
                  </p>
                )}
              </section>

              {selectedBooth && (
                <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Booth Maintenance & Status</h3>
                      <p className="text-sm text-gray-600">
                        Current status: <span className="font-medium capitalize">{selectedBooth.status}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onSetBoothStatus(selectedBooth.id, "maintenance")}
                        className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
                      >
                        Mark Maintenance
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetBoothStatus(selectedBooth.id, "online")}
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
                      >
                        Mark Online
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {selectedBooth && (
                <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2">
                    <PlusCircleIcon className="h-5 w-5 text-indigo-700" />
                    <h3 className="text-lg font-semibold text-gray-800">Add / Remove Books In Booth</h3>
                  </div>

                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(event) => setNewTitle(event.target.value)}
                      placeholder="Book title"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800"
                    />
                    <input
                      type="text"
                      value={newAuthor}
                      onChange={(event) => setNewAuthor(event.target.value)}
                      placeholder="Author"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800"
                    />
                    <input
                      type="number"
                      min={1}
                      value={newCopies}
                      onChange={(event) => setNewCopies(Math.max(1, Number(event.target.value) || 1))}
                      placeholder="Copies"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onAddBookToBooth(selectedBooth.id, newTitle, newAuthor, newCopies);
                      setNewTitle("");
                      setNewAuthor("");
                      setNewCopies(1);
                    }}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-medium text-white"
                  >
                    <PlusCircleIcon className="h-4 w-4" />
                    Add Book
                  </button>

                  <div className="mt-4 space-y-2">
                    {selectedBooks.map((book) => (
                      <div key={book.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                        <div>
                          <p className="font-medium text-gray-800">{book.title}</p>
                          <p className="text-sm text-gray-600">{book.author}</p>
                          <p className="text-xs text-gray-500">Copies: {book.availableCopies}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveBookFromBooth(selectedBooth.id, book.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
                        >
                          <Trash2Icon className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
              <Settings2Icon className="mx-auto h-8 w-8 text-indigo-700" />
              <p className="mt-2 text-lg font-semibold text-gray-800 capitalize">{activeRole} workspace</p>
              <p className="mt-1 text-sm text-gray-500">Use role switch to enter operator workflow.</p>
            </div>
          )}

          {canSwitch && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left">
              <p className="mb-2 text-sm font-medium text-gray-700">Switch working role</p>
              <div className="grid grid-cols-2 gap-2">
                {(["admin", "operator"] as UserRole[]).map((roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => onSwitchRole(roleOption)}
                    className={clsx(
                      "rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors",
                      activeRole === roleOption
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {roleOption}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
