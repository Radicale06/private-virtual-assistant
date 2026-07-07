import { Link } from "react-router-dom";
import { Bullets, Callout, LegalLayout, Section } from "./LegalLayout";

export function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="July 8, 2026"
      intro={
        <>
          This Privacy Policy explains what information Musaed ("Musaed", "we", "us") collects,
          how we use it, and the choices you have. Musaed is a personal AI assistant reachable
          over WhatsApp that helps you manage your calendar, reminders, email, and meetings.
        </>
      }
    >
      <Section n={1} title="Information we collect">
        <Bullets
          items={[
            "Account information — name, email, phone number, timezone, and plan.",
            "Messages you send — the text and voice notes you send to the assistant, and voice-note transcriptions.",
            "Connected-account data — when you link Google, Microsoft, Calendly, or Zoom, the calendar, email, and meeting data needed to perform the actions you request.",
            "Usage and technical data — logs, device/connection metadata, and diagnostics used to operate and secure the Service.",
          ]}
        />
      </Section>

      <Section n={2} title="How we use information">
        <Bullets
          items={[
            "To provide the assistant: interpret your requests and take the actions you ask for (create events, set reminders, draft or send email, generate meeting links).",
            "To send you Service messages over WhatsApp and deliver proactive reminders and briefings you enable.",
            "To operate, secure, troubleshoot, and improve the Service.",
            "To process payments and provide support.",
          ]}
        />
        <p>
          We do <strong>not</strong> sell your personal information, and we do <strong>not</strong>{" "}
          use the content of your connected accounts for advertising.
        </p>
      </Section>

      <Section n={3} title="Google user data & Limited Use">
        <p>
          When you connect a Google account, Musaed requests only the scopes needed to provide
          the features you use (Google Calendar, and — if you enable email features — Gmail read
          and send). We access this data solely to perform actions you request.
        </p>
        <Callout>
          Musaed's use and transfer to any other app of information received from Google APIs will
          adhere to the{" "}
          <a
            className="text-primary hover:underline"
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. We do not use Google user data for advertising,
          do not sell it, and do not transfer it except to provide or improve user-facing features,
          to comply with law, or as part of a merger where this policy continues to apply.
        </Callout>
        <p>
          You can revoke Musaed's access at any time from your account settings or from your{" "}
          <a
            className="text-primary hover:underline"
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noreferrer"
          >
            Google account permissions
          </a>
          .
        </p>
      </Section>

      <Section n={4} title="Service providers we use">
        <p>We share data with vetted providers only to run the Service:</p>
        <Bullets
          items={[
            "OpenAI — to interpret requests and transcribe voice notes.",
            "Twilio and WhatsApp — to deliver messaging.",
            "Google and Microsoft — the accounts you choose to connect.",
            "Our cloud hosting and database providers, and our payment processor.",
          ]}
        />
        <p>These providers process data on our behalf under their own security and privacy commitments.</p>
      </Section>

      <Section n={5} title="How we protect data">
        <Bullets
          items={[
            "Integration access tokens are encrypted at rest.",
            "Traffic is served over HTTPS/TLS.",
            "Access to production systems is restricted and monitored.",
          ]}
        />
        <p>No method of transmission or storage is completely secure, but we work to protect your data.</p>
      </Section>

      <Section n={6} title="Data retention">
        <p>
          We keep your information for as long as your account is active and as needed to provide
          the Service. You can delete your account, which removes your personal data and revokes
          connected integrations, except where we must retain limited records to comply with legal
          obligations.
        </p>
      </Section>

      <Section n={7} title="Your rights & choices">
        <Bullets
          items={[
            "Access, correct, or delete your personal information.",
            "Disconnect any integration at any time to revoke ongoing access.",
            "Close your account.",
            "Depending on where you live, you may have additional rights under laws such as GDPR or CCPA.",
          ]}
        />
        <p>
          To exercise any of these, contact{" "}
          <a className="text-primary hover:underline" href="mailto:support@musaed.pro">
            support@musaed.pro
          </a>
          .
        </p>
      </Section>

      <Section n={8} title="International transfers">
        <p>
          Your information may be processed in countries other than your own. Where required, we
          use appropriate safeguards for such transfers.
        </p>
      </Section>

      <Section n={9} title="Children">
        <p>The Service is not directed to children under 18, and we do not knowingly collect their data.</p>
      </Section>

      <Section n={10} title="Changes to this policy">
        <p>
          We may update this Policy from time to time. If we make material changes, we will notify
          you through the Service or by email. The "last updated" date above reflects the latest
          revision.
        </p>
      </Section>

      <Section n={11} title="Contact">
        <p>
          Questions about privacy? Email{" "}
          <a className="text-primary hover:underline" href="mailto:support@musaed.pro">
            support@musaed.pro
          </a>
          . See also our{" "}
          <Link className="text-primary hover:underline" to="/terms">
            Terms of Service
          </Link>
          .
        </p>
      </Section>
    </LegalLayout>
  );
}
