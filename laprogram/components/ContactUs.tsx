import Link from "next/link";

export default function ContactUs() {
  return (
    <Link
      href="/contact"
      className="underline-offset-2 hover:underline text-primary"
    >
      contact us
    </Link>
  );
}
