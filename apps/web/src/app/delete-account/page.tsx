import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account Deletion | The Original I Ching App",
  description: "How to delete your account and what data is removed from The Original I Ching App.",
  robots: { index: true, follow: true },
};

export default function DeleteAccountPage() {
  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">← Back to app</Link>
        {" · "}
        <Link href="/privacy">Privacy Policy</Link>
        {" · "}
        <Link href="/terms">Terms of Service</Link>
      </nav>
      <article className="doc-article">
        <h1>Account Deletion</h1>
        <p>
          You can permanently delete your account and all associated data directly from within the app.
        </p>

        <h2>How to delete your account</h2>
        <ol>
          <li>Open the app and sign in.</li>
          <li>
            Tap <strong>Options</strong> (the gear / settings button in the composer footer).
          </li>
          <li>
            Scroll to <strong>Delete account</strong> and tap <strong>Delete my account</strong>.
          </li>
          <li>
            In the confirmation dialog, type <strong>DELETE</strong> (or <strong>ELIMINAR</strong> in Spanish) and confirm.
          </li>
        </ol>
        <p>
          Your account is deleted immediately. You will be signed out automatically.
        </p>

        <h2>What data is deleted</h2>
        <ul>
          <li>Your user profile and login credentials.</li>
          <li>All consultation sessions and chat history.</li>
          <li>Token balance and usage records.</li>
          <li>Two-factor authentication configuration.</li>
          <li>All personal preferences and settings.</li>
        </ul>

        <h2>What data is retained</h2>
        <p>
          Purchase and transaction records are retained for a minimum period required by applicable tax and accounting laws.
          These records are anonymized and contain no personally identifiable information after deletion.
        </p>

        <h2>RevenueCat / Stripe</h2>
        <p>
          Deleting your account also sends a deletion request to RevenueCat (our payment processor).
          Stripe may retain anonymized transaction records as required by financial regulations.
        </p>

        <h2>Cannot access the app?</h2>
        <p>
          If you are unable to sign in and wish to request account deletion, email us at{" "}
          <a href="mailto:privacy@theoriginaliching.com">privacy@theoriginaliching.com</a>{" "}
          with your registered email address. We will process your request within 30 days.
        </p>
      </article>
      <nav className="doc-nav">
        <Link href="/">← Back to app</Link>
        {" · "}
        <Link href="/privacy">Privacy Policy</Link>
        {" · "}
        <Link href="/terms">Terms of Service</Link>
      </nav>
    </div>
  );
}
