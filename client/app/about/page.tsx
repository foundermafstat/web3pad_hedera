import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PageWithFooter } from '@/components/PageWithFooter';
import { FaMobile, FaGamepad, FaUsers, FaBolt, FaShieldAlt, FaGlobe, FaArrowRight, FaPlay, FaWifi, FaBullseye } from 'react-icons/fa';

export default function AboutPage() {
	return (
		<PageWithFooter>
			<div className="min-h-screen bg-background">
			<div className="container mx-auto py-12 max-w-7xl pt-16">
				{/* Hero Section */}
				<div className="text-center mb-16">
					<Badge variant="outline" className="mb-4">
						<div className="inline-flex items-center gap-2">
							<div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/50 text-primary">
								<FaGamepad className="w-4 h-4" />
							</div>
							Online Gaming Platform
						</div>
					</Badge>
					<h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
						W3P Platform
					</h1>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
						Revolutionary gaming platform where your smartphone becomes the controller. 
						Play in your browser on the big screen while controlling your character from your mobile device.
					</p>
				</div>

				{/* Key Features */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
					<Card className="text-center">
						<CardHeader>
							<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<FaMobile className="w-6 h-6 text-primary" />
							</div>
							<CardTitle>Mobile Controller</CardTitle>
							<CardDescription>
								Your smartphone becomes a full-featured gamepad with gyroscope, touch, and vibration
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<FaGlobe className="w-6 h-6 text-primary" />
							</div>
							<CardTitle>Browser Games</CardTitle>
							<CardDescription>
								Play directly in your browser without installing additional applications
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<FaUsers className="w-6 h-6 text-primary" />
							</div>
							<CardTitle>Multiplayer</CardTitle>
							<CardDescription>
								Play with friends in real-time within the same gaming session
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<FaBolt className="w-6 h-6 text-primary" />
							</div>
							<CardTitle>Instant Access</CardTitle>
							<CardDescription>
								Connect to games in seconds via QR code or direct link
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<FaShieldAlt className="w-6 h-6 text-primary" />
							</div>
							<CardTitle>Web3 Ready</CardTitle>
							<CardDescription>
								Integration with blockchain wallets and NFTs for future games
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<FaWifi className="w-6 h-6 text-primary" />
							</div>
							<CardTitle>Low Latency</CardTitle>
							<CardDescription>
								Optimized WebSocket connection for responsive control
							</CardDescription>
						</CardHeader>
					</Card>
				</div>

				{/* How It Works */}
				<div className="mb-16">
					<h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl font-bold text-primary">1</span>
							</div>
							<h3 className="text-xl font-semibold mb-2">Choose a Game</h3>
							<p className="text-muted-foreground">
								Open any game in your browser on computer or tablet
							</p>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl font-bold text-primary">2</span>
							</div>
							<h3 className="text-xl font-semibold mb-2">Connect Your Phone</h3>
							<p className="text-muted-foreground">
								Scan the QR code or follow the link on your mobile device
							</p>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl font-bold text-primary">3</span>
							</div>
							<h3 className="text-xl font-semibold mb-2">Play!</h3>
							<p className="text-muted-foreground">
								Use your phone as a controller and enjoy the game
							</p>
						</div>
					</div>
				</div>

				{/* Technology Stack */}
				<Card className="mb-16">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">Technology Stack</CardTitle>
						<CardDescription>
							Modern web technologies for maximum performance
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
							<div>
								<h4 className="font-semibold mb-2">Frontend</h4>
								<div className="space-y-1 text-sm text-muted-foreground">
									<p>Next.js 15</p>
									<p>React 19</p>
									<p>TypeScript</p>
									<p>Tailwind CSS</p>
								</div>
							</div>
							<div>
								<h4 className="font-semibold mb-2">Backend</h4>
								<div className="space-y-1 text-sm text-muted-foreground">
									<p>Node.js</p>
									<p>Socket.io</p>
									<p>Prisma ORM</p>
									<p>PostgreSQL</p>
								</div>
							</div>
							<div>
								<h4 className="font-semibold mb-2">Mobile</h4>
								<div className="space-y-1 text-sm text-muted-foreground">
									<p>Web APIs</p>
									<p>Gyroscope</p>
									<p>Touch Events</p>
									<p>Vibration</p>
								</div>
							</div>
							<div>
								<h4 className="font-semibold mb-2">Web3</h4>
								<div className="space-y-1 text-sm text-muted-foreground">
									<p>Blockchain</p>
									<p>Smart Contracts</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* CTA Section */}
				<div className="text-center">
					<h2 className="text-3xl font-bold mb-4">Ready to Start Gaming?</h2>
					<p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
						Explore our games and discover a new level of interactive gaming
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link href="/games">
							<Button size="lg" className="gap-2">
								<FaPlay className="w-5 h-5" />
								Browse Games
							</Button>
						</Link>
						<Link href="/about/controller">
							<Button size="lg" variant="outline" className="gap-2">
								<FaBullseye className="w-5 h-5" />
								How Controller Works
								<FaArrowRight className="w-4 h-4" />
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
		</PageWithFooter>
	);
}
