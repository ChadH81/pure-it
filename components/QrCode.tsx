/**
 * Renders a QR code for a URL. v1 uses a lightweight external QR image service
 * (the encoded data is only a short game code, nothing sensitive). Swap the
 * `src` for a bundled generator later if you want zero third-party calls.
 */
export default function QrCode({ url, size = 208 }: { url: string; size?: number }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(
    url
  )}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={size}
      height={size}
      alt="Scan to watch this live game"
      loading="lazy"
      className="rounded-xl bg-white p-2 shadow-lg"
    />
  );
}
