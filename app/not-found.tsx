import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap" style={{ padding: "88px 24px", maxWidth: 640 }}>
      <p className="eyebrow">Error 404</p>
      <h1 style={{ marginBottom: ".8rem" }}>That page is not here</h1>
      <p>
        The link may be old, or it may have been mistyped. Nothing was deleted recently, so
        it is most likely the address.
      </p>
      <p style={{ marginTop: "1.4rem", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/" className="btn btn-primary">Go to the front page</Link>
        <Link href="/explore" className="btn">Open the brain map</Link>
      </p>
    </section>
  );
}
