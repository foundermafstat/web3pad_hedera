'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageWithFooter } from '@/components/PageWithFooter';

export default function TermsOfServicePage() {
	return (
		<PageWithFooter>
			<Header />
			<main className="container mx-auto max-w-4xl px-2 pt-16">
				<div className="prose prose-gray max-w-none">
					<h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
					<p className="text-lg text-muted-foreground mb-8">
						Last updated: January 2025
					</p>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
						<p>
							By accessing and using Web3Pad ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
						<p>
							Web3Pad is a multiplayer gaming platform that allows users to:
						</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>Play multiplayer games using their mobile devices as controllers</li>
							<li>Connect blockchain wallets to earn rewards and NFTs</li>
							<li>Participate in competitive gaming sessions</li>
							<li>Access leaderboards and achievement systems</li>
							<li>Interact with Web3 technologies and smart contracts</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
						<div className="space-y-4">
							<h3 className="text-xl font-medium">3.1 Account Creation</h3>
							<p>
								To use certain features of the Service, you may need to create an account. You agree to:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Provide accurate, current, and complete information</li>
								<li>Maintain and update your information to keep it accurate</li>
								<li>Maintain the security of your password and account</li>
								<li>Accept responsibility for all activities under your account</li>
							</ul>

							<h3 className="text-xl font-medium">3.2 Wallet Connection</h3>
							<p>
								When connecting blockchain wallets, you acknowledge that:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>You are responsible for the security of your private keys</li>
								<li>We do not store or have access to your private keys</li>
								<li>Blockchain transactions are irreversible</li>
								<li>You understand the risks associated with Web3 technologies</li>
							</ul>
						</div>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
						<div className="space-y-4">
							<h3 className="text-xl font-medium">4.1 Permitted Uses</h3>
							<p>You may use the Service for lawful purposes only, including:</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Playing games in accordance with the rules</li>
								<li>Participating in legitimate competitions</li>
								<li>Connecting approved blockchain wallets</li>
								<li>Sharing content that you own or have permission to share</li>
							</ul>

							<h3 className="text-xl font-medium">4.2 Prohibited Uses</h3>
							<p>You agree not to:</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Use the Service for any illegal or unauthorized purpose</li>
								<li>Attempt to gain unauthorized access to any part of the Service</li>
								<li>Interfere with or disrupt the Service or servers</li>
								<li>Use automated systems to access the Service without permission</li>
								<li>Harass, abuse, or harm other users</li>
								<li>Share malicious code or attempt to compromise security</li>
								<li>Violate any applicable laws or regulations</li>
							</ul>
						</div>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
						<div className="space-y-4">
							<h3 className="text-xl font-medium">5.1 Our Content</h3>
							<p>
								The Service and its original content, features, and functionality are owned by Web3Pad and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
							</p>

							<h3 className="text-xl font-medium">5.2 User Content</h3>
							<p>
								You retain ownership of content you create or upload. By using the Service, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with the Service.
							</p>

							<h3 className="text-xl font-medium">5.3 Third-Party Content</h3>
							<p>
								The Service may include content from third parties. We are not responsible for such content and do not endorse it.
							</p>
						</div>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">6. Blockchain and Cryptocurrency</h2>
						<div className="space-y-4">
							<h3 className="text-xl font-medium">6.1 Blockchain Integration</h3>
							<p>
								Web3Pad integrates with various blockchain networks. You acknowledge that:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Blockchain transactions are irreversible and permanent</li>
								<li>Cryptocurrency values are highly volatile</li>
								<li>Smart contracts may contain bugs or vulnerabilities</li>
								<li>Regulatory changes may affect the Service</li>
							</ul>

							<h3 className="text-xl font-medium">6.2 NFTs and Tokens</h3>
							<p>
								Any NFTs or tokens earned through the Service are subject to the terms of their respective smart contracts and blockchain networks.
							</p>
						</div>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">7. Privacy and Data Protection</h2>
						<p>
							Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">8. Disclaimers and Limitations</h2>
						<div className="space-y-4">
							<h3 className="text-xl font-medium">8.1 Service Availability</h3>
							<p>
								The Service is provided "as is" and "as available." We make no warranties that the Service will be uninterrupted, secure, or error-free.
							</p>

							<h3 className="text-xl font-medium">8.2 Limitation of Liability</h3>
							<p>
								To the maximum extent permitted by law, Web3Pad shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses.
							</p>

							<h3 className="text-xl font-medium">8.3 No Investment Advice</h3>
							<p>
								Nothing in the Service constitutes investment, financial, trading, or other advice. You should not rely on the Service for any financial decisions.
							</p>
						</div>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
						<p>
							You agree to defend, indemnify, and hold harmless Web3Pad and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees).
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
						<p>
							We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
						<p>
							These Terms shall be interpreted and governed by the laws of the jurisdiction in which Web3Pad operates, without regard to its conflict of law provisions.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
						<p>
							We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
						<p>
							If you have any questions about these Terms of Service, please contact us:
						</p>
						<div className="bg-muted p-4 rounded-lg mt-4">
							<p><strong>Email:</strong> legal@web3pad.xyz</p>
							<p><strong>Website:</strong> <a href="/contact" className="text-primary hover:underline">Contact Form</a></p>
						</div>
					</section>
				</div>
			</main>
		</PageWithFooter>
	);
}
