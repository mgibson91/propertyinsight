import React from 'react';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
};

export default function PrivacyPage() {
  return (
    <div className="text-primary-text-contrast flex flex-col gap-3 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="text-sm">
          <strong>Last Updated:</strong> <em>December 2, 2023</em>
        </p>
      </div>

      <h2 className="text-xl font-semibold">Introduction</h2>
      <p>
        Welcome to Tradescan. Your trust is our top priority, and we are committed to protecting the privacy and
        security of your personal information. This policy outlines how we collect, use, and share the data we gather
        from you on our platform.
      </p>

      <h2 className="text-xl font-semibold">Information We Collect</h2>
      <h3 className="text-lg font-semibold">Personal Data</h3>
      <p>We collect the following personal data:</p>
      <ul className="list-disc pl-5">
        <li>
          <strong>Email addresses</strong>
        </li>
      </ul>
      <p>This data is stored securely in Supabase.</p>

      <h3 className="text-lg font-semibold">Non-Personal Data</h3>
      <p>
        We gather non-personal data for analytics and improvement purposes. This includes data collected via Axiom,
        which provides insights into user behavior and platform performance but does not personally identify you.
      </p>

      <h2 className="text-xl font-semibold">How We Use the Information</h2>
      <p>The personal and non-personal data we collect serves the following purposes:</p>
      <ul className="list-disc pl-5">
        <li>
          <strong>Personalize Your Experience</strong>: To ensure your experience with our platform is as seamless and
          personalized as possible.
        </li>
        <li>
          <strong>Direct Communication</strong>: We may use your personal data to communicate directly with you for
          updates, support, or other platform-related matters.
        </li>
      </ul>

      <h2 className="text-xl font-semibold">Storage and Protection of Data</h2>

      <h3 className="text-lg font-semibold">Where Your Data is Stored</h3>
      <p>
        Your email address is securely stored on Supabase's cloud infrastructure. Supabase ensures high levels of
        security and compliance, keeping your data safe and private.
      </p>

      <h3 className="text-lg font-semibold">Duration of Storage</h3>
      <p>
        Your data will be stored indefinitely. However, you have the right to request the deletion of your personal data
        at any time.
      </p>

      <h3 className="text-lg font-semibold">Protection Measures</h3>
      <p>
        We take your data's security seriously. While stored on Supabase, your data is protected by robust security
        measures.
      </p>

      <h2 className="text-xl font-semibold">Cookies and Tracking</h2>
      <p>
        To enhance your experience on our platform, we use essential and limited cookies. These cookies do not store any
        personal information but help improve site functionality and user experience.
      </p>

      <h2 className="text-xl font-semibold">Your Rights</h2>

      <h3 className="text-lg font-semibold">Data Deletion</h3>
      <p>
        At any time, you can request the deletion of your personal data stored by our platform. To do so, please contact
        our support, and we will assist you promptly.
      </p>

      <h2 className="text-xl font-semibold">Changes to This Privacy Policy</h2>
      <p>
        From time to time, we may update this policy. We will notify you of any changes by updating the "Last Updated"
        date at the top of this page. It is recommended to review this policy periodically for any changes.
      </p>

      <h2 className="text-xl font-semibold">Contact Us</h2>
      <p>
        For any privacy-specific concerns or queries about this privacy policy, please contact us through our platform's
        contact page.
      </p>
    </div>
  );
}
