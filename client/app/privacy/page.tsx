'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageWithFooter } from '@/components/PageWithFooter';

export default function PrivacyPolicyPage() {
	return (
		<PageWithFooter>
			<Header />
			<main className="container mx-auto max-w-4xl px-2 pt-16">
				<div className="prose prose-gray max-w-none">
					<h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
					<p className="text-lg text-muted-foreground mb-8">
						Last updated: October 2025
					</p>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
						<div className="space-y-4">
							<h3 className="text-xl font-medium">1.1 Personal Information</h3>
							<p>
								When you use Web3Pad, we may collect the following types of personal information:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Email address (when you subscribe to our newsletter)</li>
								<li>Blockchain wallet addresses (when you connect your wallet)</li>
								<li>Game performance data and achievements</li>
								<li>Device information and browser type</li>
								<li>Usage patterns and preferences</li>
							</ul>

							<h3 className="text-xl font-medium">1.2 Automatically Collected Information</h3>
							<p>
								We automatically collect certain information when you visit our website:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>IP address and location data</li>
								<li>Browser type and version</li>
								<li>Operating system</li>
								<li>Pages visited and time spent on site</li>
								<li>Referring website</li>
							</ul>
						</div>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
						<p>We use the collected information for the following purposes:</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>To provide and improve our gaming services</li>
							<li>To process transactions and manage your account</li>
							<li>To send you newsletters and updates (with your consent)</li>
							<li>To analyze usage patterns and improve user experience</li>
							<li>To prevent fraud and ensure platform security</li>
							<li>To comply with legal obligations</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
						<p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>With your explicit consent</li>
							<li>To comply with legal requirements or court orders</li>
							<li>To protect our rights and prevent fraud</li>
							<li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
							<li>In case of a business merger or acquisition</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">4. Blockchain and Web3 Data</h2>
						<p>
							Web3Pad integrates with blockchain networks. Please note:
						</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>Blockchain transactions are public and permanent</li>
							<li>We do not store your private keys or seed phrases</li>
							<li>Wallet connections are handled securely through your browser</li>
							<li>NFT and token data is retrieved from public blockchain networks</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
						<p>
							We implement appropriate security measures to protect your personal information:
						</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>Encryption of data in transit and at rest</li>
							<li>Regular security audits and updates</li>
							<li>Access controls and authentication</li>
							<li>Secure hosting infrastructure</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
						<p>You have the following rights regarding your personal information:</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>Access your personal data</li>
							<li>Correct inaccurate information</li>
							<li>Delete your account and data</li>
							<li>Opt-out of marketing communications</li>
							<li>Data portability</li>
							<li>Object to processing</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
						<p>
							We use cookies and similar technologies to enhance your experience:
						</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>Essential cookies for website functionality</li>
							<li>Analytics cookies to understand usage</li>
							<li>Preference cookies to remember your settings</li>
							<li>You can control cookie settings in your browser</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
						<p>
							Web3Pad is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">9. International Transfers</h2>
						<p>
							Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
						<p>
							We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our service after any changes constitutes acceptance of the updated policy.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
						<p>
							If you have any questions about this privacy policy or our data practices, please contact us:
						</p>
						<div className="bg-muted p-4 rounded-lg mt-4">
							<p><strong>Email:</strong> privacy@web3pad.xyz</p>
							<p><strong>Website:</strong> <a href="/contact" className="text-primary hover:underline">Contact Form</a></p>
						</div>
					</section>
				</div>
			</main>
		</PageWithFooter>
	);
}
