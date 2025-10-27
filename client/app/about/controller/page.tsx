import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FaMobile, FaGamepad, RotateCw, FaVibrate, FaBolt, FaArrowLeft, FaWifi, FaBullseye, FaCog, FaGamepad as Joystick } from 'react-icons/fa';
import { PageWithFooter } from '@/components/PageWithFooter';

export default function ControllerPage() {
	return (
		<PageWithFooter>
			<div className="min-h-screen bg-background">
			<div className="container mx-auto py-12 pt-20">
				{/* Breadcrumb */}
				<div className="mb-8">
					<Link 
						href="/about" 
						className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
					>
						<FaArrowLeft className="w-4 h-4" />
						Back to Project Overview
					</Link>
				</div>

				{/* Hero Section */}
				<div className="text-center mb-16">
					<Badge variant="outline" className="mb-4">
						📱 Mobile Controller
					</Badge>
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
						Your Phone is a Gamepad
					</h1>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
						Discover how your smartphone transforms into a professional gaming controller 
						with support for all modern sensors and interaction technologies.
					</p>
				</div>

				{/* Controller Features */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
					<Card className="text-center">
						<CardHeader>
							<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<FaMobile className="w-6 h-6 text-primary" />
							</div>
							<CardTitle>Touch Control</CardTitle>
							<CardDescription>
								Multi-touch, swipes, long presses for precise character control
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<RotateCw className="w-6 h-6 text-primary" />
							</div>
							<CardTitle>Gyroscope</CardTitle>
							<CardDescription>
								Device tilts and rotations for realistic control in racing games and simulators
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<FaVibrate className="w-6 h-6 text-primary" />
							</div>
							<CardTitle>Haptic Feedback</CardTitle>
							<CardDescription>
								Vibration for realistic sensations during shooting, impacts, and explosions
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<Joystick className="w-6 h-6 text-primary" />
							</div>
							<CardTitle>Virtual Joystick</CardTitle>
							<CardDescription>
								Software analog sticks for smooth and precise movement
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<FaBolt className="w-6 h-6 text-primary" />
							</div>
							<CardTitle>Low Latency</CardTitle>
							<CardDescription>
								Optimized data transmission via WebSocket with minimal delay
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<FaCog className="w-6 h-6 text-primary" />
							</div>
							<CardTitle>Customization</CardTitle>
							<CardDescription>
								Personalize sensitivity, element placement, and control modes
							</CardDescription>
						</CardHeader>
					</Card>
				</div>

				{/* How It Works Technical */}
				<Card className="mb-16">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">Technical Implementation</CardTitle>
						<CardDescription>
							How we transform your phone into a professional controller
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-2 gap-8">
							<div>
								<h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
									<FaWifi className="w-5 h-5 text-primary" />
									Connection
								</h3>
								<div className="space-y-4 text-muted-foreground">
									<div className="flex gap-4">
										<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
											<span className="text-sm font-bold text-primary">1</span>
										</div>
										<div>
											<p className="font-medium text-foreground">QR Code Scanning</p>
											<p className="text-sm">Quick connection via phone camera</p>
										</div>
									</div>
									<div className="flex gap-4">
										<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
											<span className="text-sm font-bold text-primary">2</span>
										</div>
										<div>
											<p className="font-medium text-foreground">WebSocket Connection</p>
											<p className="text-sm">Establishing real-time bidirectional communication channel</p>
										</div>
									</div>
									<div className="flex gap-4">
										<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
											<span className="text-sm font-bold text-primary">3</span>
										</div>
										<div>
											<p className="font-medium text-foreground">Synchronization</p>
											<p className="text-sm">Sensor calibration and control parameter setup</p>
										</div>
									</div>
								</div>
							</div>

							<div>
								<h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
									<FaBullseye className="w-5 h-5 text-primary" />
									Data Transmission
								</h3>
								<div className="space-y-4 text-muted-foreground">
									<div className="flex gap-4">
										<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
											<span className="text-sm font-bold text-primary">1</span>
										</div>
										<div>
											<p className="font-medium text-foreground">Sensor Data Collection</p>
											<p className="text-sm">Processing touch, gyroscope, and accelerometer data</p>
										</div>
									</div>
									<div className="flex gap-4">
										<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
											<span className="text-sm font-bold text-primary">2</span>
										</div>
										<div>
											<p className="font-medium text-foreground">Compression & Transmission</p>
											<p className="text-sm">Optimized data sending at 60 FPS rate</p>
										</div>
									</div>
									<div className="flex gap-4">
										<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
											<span className="text-sm font-bold text-primary">3</span>
										</div>
										<div>
											<p className="font-medium text-foreground">In-Game Processing</p>
											<p className="text-sm">Instant game engine response to commands</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Supported Games */}
				<Card className="mb-16">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">Supported Game Types</CardTitle>
						<CardDescription>
							Different control modes for various game genres
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
										<FaBullseye className="w-5 h-5 text-primary" />
									</div>
									<div>
										<h4 className="font-semibold">Shooters</h4>
										<p className="text-sm text-muted-foreground">
											Dual-stick control: left stick for movement, right stick for aiming
										</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
										<RotateCw className="w-5 h-5 text-primary" />
									</div>
									<div>
										<h4 className="font-semibold">Racing</h4>
										<p className="text-sm text-muted-foreground">
											Device tilt control for steering wheel rotation
										</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
										<FaMobile className="w-5 h-5 text-primary" />
									</div>
									<div>
										<h4 className="font-semibold">Strategy</h4>
										<p className="text-sm text-muted-foreground">
											Touch control for selecting units and buildings
										</p>
									</div>
								</div>
							</div>
							<div className="space-y-4">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
										<FaGamepad className="w-5 h-5 text-primary" />
									</div>
									<div>
										<h4 className="font-semibold">Platformers</h4>
										<p className="text-sm text-muted-foreground">
											Virtual D-pad and action buttons
										</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
										<FaBolt className="w-5 h-5 text-primary" />
									</div>
									<div>
										<h4 className="font-semibold">Arcade</h4>
										<p className="text-sm text-muted-foreground">
											Fast taps and gestures for dynamic gameplay
										</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
										<FaCog className="w-5 h-5 text-primary" />
									</div>
									<div>
										<h4 className="font-semibold">Quiz Games</h4>
										<p className="text-sm text-muted-foreground">
											Intuitive answer selection with screen taps
										</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* CTA Section */}
				<div className="text-center">
					<h2 className="text-3xl font-bold mb-4">Try the Controller in Action</h2>
					<p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
						Choose any game and experience the revolutionary control method
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link href="/games">
							<Button size="lg" className="gap-2">
								<FaGamepad className="w-5 h-5" />
								Start Playing
							</Button>
						</Link>
						<Link href="/about">
							<Button size="lg" variant="outline" className="gap-2">
								<FaArrowLeft className="w-4 h-4" />
								About Project
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
		</PageWithFooter>
	);
}
