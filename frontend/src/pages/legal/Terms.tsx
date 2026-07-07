import { Link } from "react-router-dom";
import { Bullets, Callout, LegalLayout, Section } from "./LegalLayout";

export function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="July 8, 2026"
      intro={
        <>
          These Terms of Service ("Terms") govern your access to and use of Musaed (the
          "Service") — a personal AI assistant reachable over WhatsApp that helps you manage
          your calendar, reminders, email, and meetings. By creating an account or using the
          Service, you agree to these Terms. If you do not agree, do not use the Service.
        </>
      }
    >
      <Section n={1} title="Who we are">
        <p>
          The Service is operated by Musaed ("Musaed", "we", "us", or "our"). You can reach us
          at <a className="text-primary hover:underline" href="mailto:support@musaed.pro">support@musaed.pro</a>.
        </p>
      </Section>

      <Section n={2} title="The Service">
        <p>
          Musaed connects to your productivity accounts and acts on your behalf when you send it
          messages or voice notes. It interprets your intent and takes actions such as creating
          calendar events, setting reminders, drafting or sending email, and generating meeting
          links. Musaed asks you to confirm before it performs sensitive or outbound actions.
        </p>
      </Section>

      <Section n={3} title="Eligibility & accounts">
        <Bullets
          items={[
            "You must be at least 18 years old and able to form a binding contract.",
            "You are responsible for the accuracy of your account information and for keeping your credentials secure.",
            "You are responsible for all activity that occurs under your account.",
          ]}
        />
      </Section>

      <Section n={4} title="Messaging over WhatsApp">
        <p>
          Musaed communicates through a shared WhatsApp number provided via our messaging
          partner (Twilio) and delivered by WhatsApp. By linking your phone number, you consent
          to send and receive messages related to the Service. Message and data rates may apply
          from your carrier. WhatsApp is a third-party service governed by its own terms.
        </p>
      </Section>

      <Section n={5} title="Third-party integrations">
        <p>
          You may connect third-party accounts — including Google (Calendar, Gmail, Meet),
          Microsoft 365 (Outlook, Teams), Calendly, and Zoom. When you connect an account, you
          authorize Musaed to access and act on that data solely to provide the Service to you.
        </p>
        <Bullets
          items={[
            "Your use of each third-party service remains subject to that provider's own terms and privacy policy.",
            "You can disconnect any integration at any time from your account settings, which revokes Musaed's ongoing access.",
            "We are not responsible for third-party services, their availability, or changes they make to their APIs.",
          ]}
        />
      </Section>

      <Section n={6} title="AI-generated content">
        <Callout>
          Musaed uses automated and AI systems to interpret your requests and generate content.
          Output may be inaccurate, incomplete, or not suitable for your purpose. Review important
          results before relying on them, and confirm actions that matter. Musaed does not provide
          legal, financial, medical, or other professional advice.
        </Callout>
      </Section>

      <Section n={7} title="Acceptable use">
        <p>You agree not to:</p>
        <Bullets
          items={[
            "Use the Service for any unlawful, harmful, deceptive, or abusive purpose.",
            "Send spam or unsolicited messages, or violate WhatsApp or any provider's policies.",
            "Attempt to access accounts or data that are not yours, or probe, scan, or breach security.",
            "Reverse engineer, resell, or overload the Service, or use it to build a competing product.",
          ]}
        />
        <p>We may suspend or terminate accounts that violate these rules.</p>
      </Section>

      <Section n={8} title="Plans, billing & cancellation">
        <Bullets
          items={[
            "Paid plans are billed in advance on a recurring basis through our payment processor. Fees are shown before you subscribe.",
            "You can cancel at any time; your plan remains active until the end of the current billing period. Fees already paid are non-refundable except where required by law.",
            "We may change pricing with reasonable prior notice, effective on your next billing cycle.",
          ]}
        />
      </Section>

      <Section n={9} title="Your content & intellectual property">
        <p>
          You retain ownership of the content you provide and the data in your connected accounts.
          You grant us a limited license to process it solely to operate and provide the Service.
          Musaed, including its software, design, and branding, remains our property.
        </p>
      </Section>

      <Section n={10} title="Privacy">
        <p>
          Our{" "}
          <Link className="text-primary hover:underline" to="/privacy">
            Privacy Policy
          </Link>{" "}
          explains what we collect, how we use it, and the choices you have. By using the Service
          you also agree to the Privacy Policy.
        </p>
      </Section>

      <Section n={11} title="Disclaimers">
        <p>
          The Service is provided "as is" and "as available", without warranties of any kind,
          whether express or implied, including fitness for a particular purpose and
          non-infringement. We do not warrant that the Service will be uninterrupted, error-free,
          or that any reminder, message, or action will always be delivered or completed.
        </p>
      </Section>

      <Section n={12} title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, Musaed will not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or for lost profits, data, or
          goodwill. Our total liability for any claim relating to the Service is limited to the
          amount you paid us in the twelve months before the event giving rise to the claim.
        </p>
      </Section>

      <Section n={13} title="Termination">
        <p>
          You may stop using the Service and delete your account at any time. We may suspend or
          terminate access if you breach these Terms or to protect the Service or other users.
          On termination, your right to use the Service ends and connected integrations are
          revoked.
        </p>
      </Section>

      <Section n={14} title="Changes to these Terms">
        <p>
          We may update these Terms from time to time. If we make material changes, we will
          provide notice through the Service or by email. Continued use after changes take effect
          constitutes acceptance of the updated Terms.
        </p>
      </Section>

      <Section n={15} title="Governing law">
        <p>
          These Terms are governed by the laws of the jurisdiction in which Musaed is established,
          without regard to conflict-of-laws rules. Courts located there will have exclusive
          jurisdiction, except where mandatory local law provides otherwise.
        </p>
      </Section>

      <Section n={16} title="Contact">
        <p>
          Questions about these Terms? Email{" "}
          <a className="text-primary hover:underline" href="mailto:support@musaed.pro">
            support@musaed.pro
          </a>
          .
        </p>
      </Section>
    </LegalLayout>
  );
}
