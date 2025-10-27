'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageWithFooter } from '@/components/PageWithFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
	FaEnvelope, 
	FaTwitter, 
	FaDiscord, 
	FaTelegramPlane, 
	FaGithub,
	FaPaperPlane,
	FaClock,
	FaMapMarkerAlt,
	FaPhone
} from 'react-icons/fa';
import { BiLogoInstagramAlt } from 'react-icons/bi';
import { useState } from 'react';

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: ''
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;

		setIsSubmitting(true);
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			setIsSubmitted(true);
			setFormData({ name: '', email: '', subject: '', message: '' });
		} catch (error) {
			console.error('Failed to send message:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const contactMethods = [
		{
			icon: <FaEnvelope className="w-6 h-6" />,
			title: 'Email',
			description: 'Send us an email anytime',
			contact: 'hello@web3pad.xyz',
			href: 'mailto:hello@web3pad.xyz'
		},
		{
			icon: <FaTwitter className="w-6 h-6" />,
			title: 'Twitter',
			description: 'Follow us for updates',
			contact: '@web3padxyz',
			href: 'https://twitter.com/web3padxyz'
		},
		{
			icon: <FaDiscord className="w-6 h-6" />,
			title: 'Discord',
			description: 'Join our community',
			contact: 'Discord Server',
			href: 'https://discord.gg/web3padxyz'
		},
		{
			icon: <FaTelegramPlane className="w-6 h-6" />,
			title: 'Telegram',
			description: 'Chat with us',
			contact: '@web3padxyz',
			href: 'https://t.me/web3padxyz'
		},
		{
			icon: <BiLogoInstagramAlt className="w-6 h-6" />,
			title: 'Instagram',
			description: 'See our latest content',
			contact: '@web3padxyz',
			href: 'https://instagram.com/web3padxyz'
		},
		{
			icon: <FaGithub className="w-6 h-6" />,
			title: 'GitHub',
			description: 'View our code',
			contact: 'web3padxyz',
			href: 'https://github.com/web3padxyz'
		}
	];

	return (
		<PageWithFooter>
			<Header />
			<main className="container mx-auto max-w-7xl px-2 pt-16 pb-12">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold mb-4">Contact Us</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Have questions about Web3Pad? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Contact Form */}
					<div>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FaPaperPlane className="w-5 h-5" />
									Send us a Message
								</CardTitle>
								<CardDescription>
									Fill out the form below and we'll get back to you within 24 hours.
								</CardDescription>
							</CardHeader>
							<CardContent>
								{isSubmitted ? (
									<div className="text-center py-8">
										<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<FaEnvelope className="w-8 h-8 text-green-600" />
										</div>
										<h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
										<p className="text-muted-foreground">
											Thank you for contacting us. We'll get back to you soon.
										</p>
									</div>
								) : (
									<form onSubmit={handleSubmit} className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label htmlFor="name" className="block text-sm font-medium mb-2">
													Full Name *
												</label>
												<Input
													id="name"
													name="name"
													type="text"
													value={formData.name}
													onChange={handleInputChange}
													required
													placeholder="Your full name"
												/>
											</div>
											<div>
												<label htmlFor="email" className="block text-sm font-medium mb-2">
													Email Address *
												</label>
												<Input
													id="email"
													name="email"
													type="email"
													value={formData.email}
													onChange={handleInputChange}
													required
													placeholder="your@email.com"
												/>
											</div>
										</div>
										<div>
											<label htmlFor="subject" className="block text-sm font-medium mb-2">
												Subject *
											</label>
											<Input
												id="subject"
												name="subject"
												type="text"
												value={formData.subject}
												onChange={handleInputChange}
												required
												placeholder="What's this about?"
											/>
										</div>
										<div>
											<label htmlFor="message" className="block text-sm font-medium mb-2">
												Message *
											</label>
											<Textarea
												id="message"
												name="message"
												value={formData.message}
												onChange={handleInputChange}
												required
												placeholder="Tell us more about your question or feedback..."
												rows={6}
											/>
										</div>
										<Button 
											type="submit" 
											disabled={isSubmitting}
											className="w-full"
										>
											{isSubmitting ? (
												<>
													<div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
													Sending...
												</>
											) : (
												<>
													<FaPaperPlane className="w-4 h-4 mr-2" />
													Send Message
												</>
											)}
										</Button>
									</form>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Contact Methods */}
					<div className="space-y-6">
						<div>
							<h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
							<p className="text-muted-foreground mb-6">
								Choose your preferred way to reach us. We're active on multiple platforms and always happy to help.
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{contactMethods.map((method, index) => (
								<Card key={index} className="hover:shadow-md transition-shadow">
									<CardContent className="p-4">
										<div className="flex items-start gap-3">
											<div className="text-primary">
												{method.icon}
											</div>
											<div className="flex-1">
												<h3 className="font-semibold mb-1">{method.title}</h3>
												<p className="text-sm text-muted-foreground mb-2">
													{method.description}
												</p>
												<a
													href={method.href}
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary hover:underline text-sm font-medium"
												>
													{method.contact}
												</a>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>

						{/* Additional Info */}
						<Card>
							<CardContent className="p-6">
								<h3 className="font-semibold mb-4 flex items-center gap-2">
									<FaClock className="w-5 h-5" />
									Response Times
								</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span>Email Support:</span>
										<span className="font-medium">Within 24 hours</span>
									</div>
									<div className="flex justify-between">
										<span>Discord/Telegram:</span>
										<span className="font-medium">Usually within 2-4 hours</span>
									</div>
									<div className="flex justify-between">
										<span>Social Media:</span>
										<span className="font-medium">1-2 business days</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-6">
								<h3 className="font-semibold mb-4 flex items-center gap-2">
									<FaMapMarkerAlt className="w-5 h-5" />
									Business Hours
								</h3>
								<div className="space-y-1 text-sm">
									<div className="flex justify-between">
										<span>Monday - Friday:</span>
										<span>9:00 AM - 6:00 PM UTC</span>
									</div>
									<div className="flex justify-between">
										<span>Saturday:</span>
										<span>10:00 AM - 4:00 PM UTC</span>
									</div>
									<div className="flex justify-between">
										<span>Sunday:</span>
										<span>Closed</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* FAQ Section */}
				<div className="mt-16">
					<h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card>
							<CardContent className="p-6">
								<h3 className="font-semibold mb-2">How do I connect my wallet?</h3>
								<p className="text-sm text-muted-foreground">
									Click the "Connect Wallet" button in the header and select your preferred wallet. We support MetaMask, WalletConnect, and other popular Web3 wallets.
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-6">
								<h3 className="font-semibold mb-2">Can I play without a wallet?</h3>
								<p className="text-sm text-muted-foreground">
									Yes! You can play most games without connecting a wallet. However, connecting a wallet allows you to earn rewards and NFTs.
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-6">
								<h3 className="font-semibold mb-2">How do I create a game room?</h3>
								<p className="text-sm text-muted-foreground">
									Go to the Games page, select your preferred game, and click "Create Room". Share the QR code with other players to join.
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-6">
								<h3 className="font-semibold mb-2">Is Web3Pad free to use?</h3>
								<p className="text-sm text-muted-foreground">
									Yes, Web3Pad is completely free to use. Some premium features may be available in the future, but core gaming functionality will always be free.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</PageWithFooter>
	);
}
