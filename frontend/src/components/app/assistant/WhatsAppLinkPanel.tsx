import { Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../lib/api";
import type { LinkStatus } from "../../../lib/types";
import { Card } from "../../ui/Card";

export function WhatsAppLinkPanel() {
  const [status, setStatus] = useState<LinkStatus | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);
  const poll = useRef<number | null>(null);

  // Generate a fresh QR link and poll for the bind to complete.
  useEffect(() => {
    api.linkStatus().then(setStatus).catch(() => undefined);
    api
      .linkAgent()
      .then((l) => setWaLink(l.wa_link))
      .catch(() => undefined);

    poll.current = window.setInterval(() => {
      api
        .linkStatus()
        .then((s) => {
          setStatus(s);
          if (s.linked && poll.current) window.clearInterval(poll.current);
        })
        .catch(() => undefined);
    }, 4000);

    return () => {
      if (poll.current) window.clearInterval(poll.current);
    };
  }, []);

  const connected = status?.linked ?? false;

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center gap-2">
        <Smartphone className="h-[18px] w-[18px] text-success" />
        <h3 className="font-headings text-lg font-semibold text-foreground">WhatsApp</h3>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-md bg-success-muted px-3 py-2.5">
        <span className="flex items-center gap-1.5 text-sm font-medium text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          {connected ? "Connected" : "Not linked"}
        </span>
        {status?.phone_number && (
          <span className="text-sm text-success">+{status.phone_number}</span>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">Re-link WhatsApp  scan to reconnect</p>

      <div className="mt-2 flex flex-col items-center gap-3 rounded-md bg-input p-5">
        <div className="rounded-md bg-surface p-3">
          {waLink ? (
            <QRCodeSVG value={waLink} size={150} bgColor="#ffffff" fgColor="#111118" />
          ) : (
            <div className="h-[150px] w-[150px] animate-pulse rounded bg-muted" />
          )}
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" />
          <span className="text-warning">Waiting to connect…</span>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Open WhatsApp and scan this QR code
        </p>
        <a
          href={waLink ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Smartphone className="h-4 w-4" />
          Open WhatsApp
        </a>
      </div>
    </Card>
  );
}
