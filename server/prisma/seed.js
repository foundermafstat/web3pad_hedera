import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting database seed...');

	// Create game types
	console.log('Creating game types...');
	
	const shooter = await prisma.gameType.upsert({
		where: { code: 'shooter' },
		update: {
			name: 'Battle Arena',
			shortDescription: 'Top-down multiplayer shooter',
			fullDescription: 'Dynamic multiplayer arena battle! Fight with bots and other players, collect power-ups and dominate the battlefield. Use your mobile phone as a controller for precise movement and shooting control.',
			icon: '🎯',
			images: ['/images/games/shooter-1.jpg', '/images/games/shooter-2.jpg'],
			videos: ['/videos/shooter-gameplay.mp4'],
			category: ['action', 'multiplayer', 'competitive'],
			gameType: 'web2',
			minPlayers: 1,
			maxPlayers: 10,
			difficulty: 'medium',
			estimatedDuration: 5,
			controls: ['touch', 'joystick', 'buttons'],
			features: [
				{ icon: '🎯', title: 'Precise Aiming', description: 'Use dual-stick controls for accurate shooting. Left stick moves your character, right stick aims and shoots.' },
				{ icon: '💥', title: 'Power-Ups', description: 'Collect shield, health, and speed boosts scattered across the arena to gain tactical advantages.' },
				{ icon: '🤖', title: 'Smart AI Enemies', description: 'Battle against intelligent bots that adapt to your play style and coordinate attacks.' },
				{ icon: '🏆', title: 'Multiplayer Battles', description: 'Join up to 10 players in intense real-time combat. Team up or go solo!' }
			],
			howToPlay: [
				'Scan the QR code displayed on the screen with your mobile device',
				'Use the left virtual joystick to move your character around the arena',
				'Use the right joystick to aim and automatically fire at enemies',
				'Collect power-ups to enhance your abilities and survive longer',
				'Eliminate enemies to earn points and climb the leaderboard',
				'Last player standing or highest score wins the match!'
			],
			tips: [
				'Keep moving - staying in one place makes you an easy target',
				'Learn the power-up spawn locations for strategic advantages',
				'Use obstacles for cover when your health is low',
				'Watch your ammo counter and reload during safe moments',
				'Team up with other players for better survival chances'
			],
			isFeatured: true,
			sortOrder: 1,
		},
		create: {
			code: 'shooter',
			name: 'Battle Arena',
			shortDescription: 'Top-down multiplayer shooter',
			fullDescription: 'Dynamic multiplayer arena battle! Fight with bots and other players, collect power-ups and dominate the battlefield. Use your mobile phone as a controller for precise movement and shooting control.',
			icon: '🎯',
			images: ['/images/games/shooter-1.jpg', '/images/games/shooter-2.jpg'],
			videos: ['/videos/shooter-gameplay.mp4'],
			category: ['action', 'multiplayer', 'competitive'],
			gameType: 'web2',
			minPlayers: 1,
			maxPlayers: 10,
			difficulty: 'medium',
			estimatedDuration: 5,
			controls: ['touch', 'joystick', 'buttons'],
			features: [
				{ icon: '🎯', title: 'Precise Aiming', description: 'Use dual-stick controls for accurate shooting. Left stick moves your character, right stick aims and shoots.' },
				{ icon: '💥', title: 'Power-Ups', description: 'Collect shield, health, and speed boosts scattered across the arena to gain tactical advantages.' },
				{ icon: '🤖', title: 'Smart AI Enemies', description: 'Battle against intelligent bots that adapt to your play style and coordinate attacks.' },
				{ icon: '🏆', title: 'Multiplayer Battles', description: 'Join up to 10 players in intense real-time combat. Team up or go solo!' }
			],
			howToPlay: [
				'Scan the QR code displayed on the screen with your mobile device',
				'Use the left virtual joystick to move your character around the arena',
				'Use the right joystick to aim and automatically fire at enemies',
				'Collect power-ups to enhance your abilities and survive longer',
				'Eliminate enemies to earn points and climb the leaderboard',
				'Last player standing or highest score wins the match!'
			],
			tips: [
				'Keep moving - staying in one place makes you an easy target',
				'Learn the power-up spawn locations for strategic advantages',
				'Use obstacles for cover when your health is low',
				'Watch your ammo counter and reload during safe moments',
				'Team up with other players for better survival chances'
			],
			isFeatured: true,
			sortOrder: 1,
		},
	});

	const race = await prisma.gameType.upsert({
		where: { code: 'race' },
		update: {
			name: 'Race Track',
			shortDescription: 'Competitive racing with obstacles',
			fullDescription: 'Feel the adrenaline of racing! Drive your car through checkpoints while avoiding obstacles. Compete with friends in real-time using your phone\'s gyroscope for realistic steering control.',
			icon: '🏎️',
			images: ['/images/games/race-1.jpg', '/images/games/race-2.jpg'],
			videos: ['/videos/race-gameplay.mp4'],
			category: ['racing', 'sport', 'multiplayer'],
			gameType: 'web2',
			minPlayers: 1,
			maxPlayers: 8,
			difficulty: 'easy',
			estimatedDuration: 3,
			controls: ['gyroscope', 'tilt', 'touch'],
			features: [
				{ icon: '🏎️', title: 'Gyroscope Steering', description: 'Tilt your phone left and right to steer your vehicle. Natural and intuitive racing control.' },
				{ icon: '⚡', title: 'Boost System', description: 'Collect boost pads to gain temporary speed bursts and overtake opponents.' },
				{ icon: '🚧', title: 'Dynamic Obstacles', description: 'Avoid barriers, oil slicks, and moving obstacles that slow you down.' },
				{ icon: '🎖️', title: 'Checkpoint Racing', description: 'Navigate through checkpoints to complete laps. Miss a checkpoint and face penalties!' }
			],
			howToPlay: [
				'Connect your phone by scanning the QR code on screen',
				'Tilt your phone left or right to steer your vehicle',
				'Tap the gas button to accelerate (or hold for continuous speed)',
				'Hit boost pads on the track for temporary speed increases',
				'Pass through all checkpoints in order to complete each lap',
				'Finish first or beat your best time to win!'
			],
			tips: [
				'Calibrate your phone at the start for optimal steering sensitivity',
				'Take corners smoothly - sharp turns will slow you down',
				'Save boosts for straight sections where you can use them fully',
				'Memorize the track layout for better checkpoint navigation',
				'Watch out for obstacles on the track edges'
			],
			isFeatured: true,
			sortOrder: 2,
		},
		create: {
			code: 'race',
			name: 'Race Track',
			shortDescription: 'Competitive racing with obstacles',
			fullDescription: 'Feel the adrenaline of racing! Drive your car through checkpoints while avoiding obstacles. Compete with friends in real-time using your phone\'s gyroscope for realistic steering control.',
			icon: '🏎️',
			images: ['/images/games/race-1.jpg', '/images/games/race-2.jpg'],
			videos: ['/videos/race-gameplay.mp4'],
			category: ['racing', 'sport', 'multiplayer'],
			gameType: 'web2',
			minPlayers: 1,
			maxPlayers: 8,
			difficulty: 'easy',
			estimatedDuration: 3,
			controls: ['gyroscope', 'tilt', 'touch'],
			features: [
				{ icon: '🏎️', title: 'Gyroscope Steering', description: 'Tilt your phone left and right to steer your vehicle. Natural and intuitive racing control.' },
				{ icon: '⚡', title: 'Boost System', description: 'Collect boost pads to gain temporary speed bursts and overtake opponents.' },
				{ icon: '🚧', title: 'Dynamic Obstacles', description: 'Avoid barriers, oil slicks, and moving obstacles that slow you down.' },
				{ icon: '🎖️', title: 'Checkpoint Racing', description: 'Navigate through checkpoints to complete laps. Miss a checkpoint and face penalties!' }
			],
			howToPlay: [
				'Connect your phone by scanning the QR code on screen',
				'Tilt your phone left or right to steer your vehicle',
				'Tap the gas button to accelerate (or hold for continuous speed)',
				'Hit boost pads on the track for temporary speed increases',
				'Pass through all checkpoints in order to complete each lap',
				'Finish first or beat your best time to win!'
			],
			tips: [
				'Calibrate your phone at the start for optimal steering sensitivity',
				'Take corners smoothly - sharp turns will slow you down',
				'Save boosts for straight sections where you can use them fully',
				'Memorize the track layout for better checkpoint navigation',
				'Watch out for obstacles on the track edges'
			],
			isFeatured: true,
			sortOrder: 2,
		},
	});

	const towerDefence = await prisma.gameType.upsert({
		where: { code: 'towerdefence' },
		update: {
			name: 'Tower Defence',
			shortDescription: 'Defend your castle from enemy waves',
			fullDescription: 'Strategic tower defense game! Build and upgrade towers, plan your defense and stop waves of enemies. Use tactical thinking and quick reflexes to protect your castle.',
			icon: '🏰',
			images: ['/images/games/tower-defence-1.jpg', '/images/games/tower-defence-2.jpg'],
			videos: ['/videos/tower-defence-gameplay.mp4'],
			category: ['strategy', 'tower-defense', 'casual'],
			gameType: 'web2',
			minPlayers: 1,
			maxPlayers: 4,
			difficulty: 'hard',
			estimatedDuration: 15,
			controls: ['touch', 'drag', 'tap'],
			features: [
				{ icon: '🏰', title: 'Strategic Placement', description: 'Place towers at key positions to maximize defense efficiency against enemy waves.' },
				{ icon: '⚔️', title: 'Tower Upgrades', description: 'Improve your towers with enhanced damage, range, and special abilities.' },
				{ icon: '👾', title: 'Enemy Waves', description: 'Face increasingly difficult waves of enemies with unique abilities and resistances.' },
				{ icon: '💰', title: 'Resource Management', description: 'Earn coins from defeated enemies and spend wisely on towers and upgrades.' }
			],
			howToPlay: [
				'Connect your mobile device by scanning the QR code',
				'Tap on empty spots to place towers (costs coins)',
				'Different tower types have unique strengths - choose wisely',
				'Tap existing towers to upgrade them for better performance',
				'Watch as enemy waves attempt to reach your castle',
				'Defend your castle through all waves to win!'
			],
			tips: [
				'Place towers at corners where enemies slow down',
				'Mix tower types for balanced defense',
				'Upgrade existing towers before building new ones',
				'Save resources for tough waves',
				'Block enemy paths strategically to force longer routes'
			],
			isFeatured: false,
			sortOrder: 4,
		},
		create: {
			code: 'towerdefence',
			name: 'Tower Defence',
			shortDescription: 'Defend your castle from enemy waves',
			fullDescription: 'Strategic tower defense game! Build and upgrade towers, plan your defense and stop waves of enemies. Use tactical thinking and quick reflexes to protect your castle.',
			icon: '🏰',
			images: ['/images/games/tower-defence-1.jpg', '/images/games/tower-defence-2.jpg'],
			videos: ['/videos/tower-defence-gameplay.mp4'],
			category: ['strategy', 'tower-defense', 'casual'],
			gameType: 'web2',
			minPlayers: 1,
			maxPlayers: 4,
			difficulty: 'hard',
			estimatedDuration: 15,
			controls: ['touch', 'drag', 'tap'],
			features: [
				{ icon: '🏰', title: 'Strategic Placement', description: 'Place towers at key positions to maximize defense efficiency against enemy waves.' },
				{ icon: '⚔️', title: 'Tower Upgrades', description: 'Improve your towers with enhanced damage, range, and special abilities.' },
				{ icon: '👾', title: 'Enemy Waves', description: 'Face increasingly difficult waves of enemies with unique abilities and resistances.' },
				{ icon: '💰', title: 'Resource Management', description: 'Earn coins from defeated enemies and spend wisely on towers and upgrades.' }
			],
			howToPlay: [
				'Connect your mobile device by scanning the QR code',
				'Tap on empty spots to place towers (costs coins)',
				'Different tower types have unique strengths - choose wisely',
				'Tap existing towers to upgrade them for better performance',
				'Watch as enemy waves attempt to reach your castle',
				'Defend your castle through all waves to win!'
			],
			tips: [
				'Place towers at corners where enemies slow down',
				'Mix tower types for balanced defense',
				'Upgrade existing towers before building new ones',
				'Save resources for tough waves',
				'Block enemy paths strategically to force longer routes'
			],
			isFeatured: false,
			sortOrder: 4,
		},
	});

	const quiz = await prisma.gameType.upsert({
		where: { code: 'quiz' },
		update: {
			name: 'Quiz Battle',
			shortDescription: 'Test your knowledge in trivia',
			fullDescription: 'Intellectual battle of minds! Answer questions from various categories: science, history, geography and more. Compete with friends in real-time and show your erudition.',
			icon: '🧠',
			images: ['/images/games/quiz-1.jpg', '/images/games/quiz-2.jpg'],
			videos: ['/videos/quiz-gameplay.mp4'],
			category: ['education', 'trivia', 'multiplayer'],
			gameType: 'web2',
			minPlayers: 2,
			maxPlayers: 8,
			difficulty: 'medium',
			estimatedDuration: 7,
			controls: ['touch', 'buttons'],
			features: [
				{ icon: '🧠', title: 'Multiple Categories', description: 'Answer questions from Science, History, Geography, Math, Technology and more!' },
				{ icon: '⏱️', title: 'Timed Challenges', description: 'Quick thinking required! Answer within the time limit to score points.' },
				{ icon: '📊', title: 'Real-time Competition', description: 'See how you stack up against other players with live scoring updates.' },
				{ icon: '🎓', title: 'Learn While Playing', description: 'Get explanations for answers and expand your knowledge as you play.' }
			],
			howToPlay: [
				'Join the game by scanning the QR code with your mobile device',
				'Read each question carefully as it appears on the main screen',
				'Select your answer from the 4 options on your phone',
				'Faster correct answers earn more points!',
				'Watch the leaderboard update after each question',
				'Player with the most points after all questions wins!'
			],
			tips: [
				'Read all answer options before selecting - don\'t rush',
				'If unsure, use the process of elimination',
				'Remember that speed matters - quick correct answers score higher',
				'Learn from the explanations shown after each question',
				'Practice in solo mode to improve your knowledge'
			],
			isFeatured: true,
			sortOrder: 3,
		},
		create: {
			code: 'quiz',
			name: 'Quiz Battle',
			shortDescription: 'Test your knowledge in trivia',
			fullDescription: 'Intellectual battle of minds! Answer questions from various categories: science, history, geography and more. Compete with friends in real-time and show your erudition.',
			icon: '🧠',
			images: ['/images/games/quiz-1.jpg', '/images/games/quiz-2.jpg'],
			videos: ['/videos/quiz-gameplay.mp4'],
			category: ['education', 'trivia', 'multiplayer'],
			gameType: 'web2',
			minPlayers: 2,
			maxPlayers: 8,
			difficulty: 'medium',
			estimatedDuration: 7,
			controls: ['touch', 'buttons'],
			features: [
				{ icon: '🧠', title: 'Multiple Categories', description: 'Answer questions from Science, History, Geography, Math, Technology and more!' },
				{ icon: '⏱️', title: 'Timed Challenges', description: 'Quick thinking required! Answer within the time limit to score points.' },
				{ icon: '📊', title: 'Real-time Competition', description: 'See how you stack up against other players with live scoring updates.' },
				{ icon: '🎓', title: 'Learn While Playing', description: 'Get explanations for answers and expand your knowledge as you play.' }
			],
			howToPlay: [
				'Join the game by scanning the QR code with your mobile device',
				'Read each question carefully as it appears on the main screen',
				'Select your answer from the 4 options on your phone',
				'Faster correct answers earn more points!',
				'Watch the leaderboard update after each question',
				'Player with the most points after all questions wins!'
			],
			tips: [
				'Read all answer options before selecting - don\'t rush',
				'If unsure, use the process of elimination',
				'Remember that speed matters - quick correct answers score higher',
				'Learn from the explanations shown after each question',
				'Practice in solo mode to improve your knowledge'
			],
			isFeatured: true,
			sortOrder: 3,
		},
	});

	const gyroTest = await prisma.gameType.upsert({
		where: { code: 'gyrotest' },
		update: {
			name: 'Gyro Test',
			shortDescription: 'Test gyroscope and vibration features',
			fullDescription: 'Experimental game for testing mobile device capabilities. Test gyroscope, accelerometer and vibration. Perfect for demonstrating the platform\'s technological capabilities.',
			icon: '📱',
			images: ['/images/games/gyro-test-1.jpg'],
			videos: ['/videos/gyro-test-gameplay.mp4'],
			category: ['test', 'experimental', 'technology'],
			gameType: 'web2',
			minPlayers: 1,
			maxPlayers: 6,
			difficulty: 'easy',
			estimatedDuration: 2,
			controls: ['gyroscope', 'accelerometer', 'vibration'],
			features: [
				{ icon: '📱', title: 'Gyroscope Testing', description: 'Test the responsiveness and accuracy of your device\'s gyroscope sensor.' },
				{ icon: '📳', title: 'Vibration Patterns', description: 'Experience different vibration patterns and test haptic feedback capabilities.' },
				{ icon: '🎮', title: 'Sensor Visualization', description: 'See real-time visualization of sensor data as you move your device.' },
				{ icon: '⚙️', title: 'Calibration Tools', description: 'Calibrate sensors and test different sensitivity settings.' }
			],
			howToPlay: [
				'Scan the QR code to connect your mobile device',
				'Follow on-screen instructions for each test',
				'Tilt and rotate your phone to test gyroscope responsiveness',
				'Tap buttons to test vibration feedback',
				'Try different test modes to explore all sensor capabilities',
				'Check the data readouts to verify sensor accuracy'
			],
			tips: [
				'Perform calibration in a stable position before testing',
				'Avoid magnetic interference for accurate readings',
				'Test in different orientations to verify all axes',
				'Note any lag or inaccuracy in sensor response',
				'Use this to verify your device works well with other games'
			],
			isFeatured: false,
			sortOrder: 5,
		},
		create: {
			code: 'gyrotest',
			name: 'Gyro Test',
			shortDescription: 'Test gyroscope and vibration features',
			fullDescription: 'Experimental game for testing mobile device capabilities. Test gyroscope, accelerometer and vibration. Perfect for demonstrating the platform\'s technological capabilities.',
			icon: '📱',
			images: ['/images/games/gyro-test-1.jpg'],
			videos: ['/videos/gyro-test-gameplay.mp4'],
			category: ['test', 'experimental', 'technology'],
			gameType: 'web2',
			minPlayers: 1,
			maxPlayers: 6,
			difficulty: 'easy',
			estimatedDuration: 2,
			controls: ['gyroscope', 'accelerometer', 'vibration'],
			features: [
				{ icon: '📱', title: 'Gyroscope Testing', description: 'Test the responsiveness and accuracy of your device\'s gyroscope sensor.' },
				{ icon: '📳', title: 'Vibration Patterns', description: 'Experience different vibration patterns and test haptic feedback capabilities.' },
				{ icon: '🎮', title: 'Sensor Visualization', description: 'See real-time visualization of sensor data as you move your device.' },
				{ icon: '⚙️', title: 'Calibration Tools', description: 'Calibrate sensors and test different sensitivity settings.' }
			],
			howToPlay: [
				'Scan the QR code to connect your mobile device',
				'Follow on-screen instructions for each test',
				'Tilt and rotate your phone to test gyroscope responsiveness',
				'Tap buttons to test vibration feedback',
				'Try different test modes to explore all sensor capabilities',
				'Check the data readouts to verify sensor accuracy'
			],
			tips: [
				'Perform calibration in a stable position before testing',
				'Avoid magnetic interference for accurate readings',
				'Test in different orientations to verify all axes',
				'Note any lag or inaccuracy in sensor response',
				'Use this to verify your device works well with other games'
			],
			isFeatured: false,
			sortOrder: 5,
		},
	});

	console.log('✅ Game types created');

	// Create sample quiz questions
	console.log('Creating quiz content...');
	
	const quizQuestions = [
		{
			category: 'general',
			difficulty: 'easy',
			data: {
				question: 'What is the capital of France?',
				answers: ['London', 'Berlin', 'Paris', 'Madrid'],
				correctIndex: 2,
				timeLimit: 10,
			},
		},
		{
			category: 'general',
			difficulty: 'easy',
			data: {
				question: 'How many continents are there?',
				answers: ['5', '6', '7', '8'],
				correctIndex: 2,
				timeLimit: 10,
			},
		},
		{
			category: 'science',
			difficulty: 'medium',
			data: {
				question: 'What is the chemical symbol for gold?',
				answers: ['Go', 'Gd', 'Au', 'Ag'],
				correctIndex: 2,
				timeLimit: 15,
			},
		},
		{
			category: 'science',
			difficulty: 'medium',
			data: {
				question: 'What planet is known as the Red Planet?',
				answers: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
				correctIndex: 1,
				timeLimit: 10,
			},
		},
		{
			category: 'history',
			difficulty: 'hard',
			data: {
				question: 'In what year did World War II end?',
				answers: ['1943', '1944', '1945', '1946'],
				correctIndex: 2,
				timeLimit: 15,
			},
		},
		{
			category: 'math',
			difficulty: 'easy',
			data: {
				question: 'What is 7 x 8?',
				answers: ['54', '56', '58', '60'],
				correctIndex: 1,
				timeLimit: 10,
			},
		},
		{
			category: 'geography',
			difficulty: 'medium',
			data: {
				question: 'Which is the longest river in the world?',
				answers: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
				correctIndex: 1,
				timeLimit: 15,
			},
		},
		{
			category: 'technology',
			difficulty: 'hard',
			data: {
				question: 'Who is considered the father of modern computing?',
				answers: ['Steve Jobs', 'Bill Gates', 'Alan Turing', 'Tim Berners-Lee'],
				correctIndex: 2,
				timeLimit: 20,
			},
		},
	];

	for (const question of quizQuestions) {
		await prisma.gameContent.create({
			data: {
				gameTypeId: quiz.id,
				type: 'question',
				category: question.category,
				difficulty: question.difficulty,
				data: question.data,
			},
		});
	}

	console.log('✅ Quiz content created');

	// Create game-specific achievements
	console.log('Creating game achievements...');
	
	const gameAchievements = [
		// Shooter achievements
		{ gameType: shooter, code: 'shooter_first_blood', title: 'First Blood', description: 'Get your first kill', points: 10, sortOrder: 1 },
		{ gameType: shooter, code: 'shooter_sharpshooter', title: 'Sharpshooter', description: 'Achieve 80% accuracy in a match', points: 25, sortOrder: 2 },
		{ gameType: shooter, code: 'shooter_unstoppable', title: 'Unstoppable', description: 'Get 10 kills without dying', points: 50, sortOrder: 3 },
		
		// Race achievements
		{ gameType: race, code: 'race_speed_demon', title: 'Speed Demon', description: 'Complete a lap under 60 seconds', points: 20, sortOrder: 1 },
		{ gameType: race, code: 'race_perfect_race', title: 'Perfect Race', description: 'Finish without hitting any obstacles', points: 30, sortOrder: 2 },
		{ gameType: race, code: 'race_drift_king', title: 'Drift King', description: 'Master cornering techniques', points: 15, sortOrder: 3 },
		
		// Quiz achievements
		{ gameType: quiz, code: 'quiz_perfectionist', title: 'Perfectionist', description: 'Answer all questions correctly', points: 50, sortOrder: 1 },
		{ gameType: quiz, code: 'quiz_speed_reader', title: 'Speed Reader', description: 'Answer within 3 seconds', points: 20, sortOrder: 2 },
		{ gameType: quiz, code: 'quiz_know_it_all', title: 'Know-It-All', description: 'Win 10 quiz games', points: 40, sortOrder: 3 },
		
		// Tower Defence achievements
		{ gameType: towerDefence, code: 'td_tower_master', title: 'Tower Master', description: 'Fully upgrade a tower', points: 25, sortOrder: 1 },
		{ gameType: towerDefence, code: 'td_castle_guardian', title: 'Castle Guardian', description: 'Complete 20 waves', points: 35, sortOrder: 2 },
		{ gameType: towerDefence, code: 'td_no_damage', title: 'No Damage', description: 'Win without losing castle health', points: 50, sortOrder: 3 },
		
		// Gyro Test achievements
		{ gameType: gyroTest, code: 'gyro_sensor_explorer', title: 'Sensor Explorer', description: 'Complete all test modes', points: 15, sortOrder: 1 },
		{ gameType: gyroTest, code: 'gyro_perfect_calibration', title: 'Perfect Calibration', description: 'Achieve optimal calibration', points: 20, sortOrder: 2 },
		{ gameType: gyroTest, code: 'gyro_tech_tester', title: 'Tech Tester', description: 'Run 10 test sessions', points: 10, sortOrder: 3 },
	];

	for (const achievement of gameAchievements) {
		await prisma.gameAchievement.upsert({
			where: { code: achievement.code },
			update: {
				title: achievement.title,
				description: achievement.description,
				points: achievement.points,
				sortOrder: achievement.sortOrder,
			},
			create: {
				gameTypeId: achievement.gameType.id,
				code: achievement.code,
				title: achievement.title,
				description: achievement.description,
				points: achievement.points,
				criteria: { auto: true },
				sortOrder: achievement.sortOrder,
			},
		});
	}

	console.log('✅ Game achievements created');

	// Create achievements
	console.log('Creating achievements...');
	
	const achievements = [
		{
			code: 'first_win',
			name: 'First Victory',
			description: 'Win your first game',
			category: 'gameplay',
			points: 10,
			criteria: { wins: 1 },
		},
		{
			code: 'perfectionist',
			name: 'Perfectionist',
			description: 'Get a perfect score in Quiz',
			category: 'gameplay',
			points: 25,
			criteria: { correctAnswers: '100%' },
		},
		{
			code: 'speed_demon',
			name: 'Speed Demon',
			description: 'Complete a race in under 60 seconds',
			category: 'gameplay',
			points: 20,
			criteria: { lapTime: { less: 60000 } },
		},
		{
			code: 'social_butterfly',
			name: 'Social Butterfly',
			description: 'Play with 10 different players',
			category: 'social',
			points: 15,
			criteria: { uniquePlayers: 10 },
		},
		{
			code: 'marathon_runner',
			name: 'Marathon Runner',
			description: 'Play 100 games',
			category: 'gameplay',
			points: 50,
			criteria: { gamesPlayed: 100 },
		},
		{
			code: 'sharp_shooter',
			name: 'Sharp Shooter',
			description: 'Get 50 kills in shooter games',
			category: 'gameplay',
			points: 30,
			criteria: { totalKills: 50 },
		},
	];

	for (const achievement of achievements) {
		await prisma.achievement.upsert({
			where: { code: achievement.code },
			update: {},
			create: achievement,
		});
	}

	console.log('✅ Achievements created');

	// Create sample users if none exist
	console.log('Checking for existing users...');
	let users = await prisma.user.findMany();
	console.log(`Found ${users.length} users in database`);

	if (users.length === 0) {
		console.log('Creating sample users...');
		
		const sampleUsers = [
			{
				email: 'alex.shooter@example.com',
				username: 'AlexShooter',
				password: '$2a$10$dVPbCv8K6JQ4K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', // placeholder hash
				displayName: 'Alex "Sniper" Rodriguez',
				avatar: 'https://ui-avatars.com/api/?name=Alex+Rodriguez&background=3b82f6&color=fff',
				level: 15,
				experience: 14500,
				coins: 2800,
			},
			{
				email: 'maria.racer@example.com',
				username: 'MariaSpeed',
				password: '$2a$10$dVPbCv8K6JQ4K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', // placeholder hash
				displayName: 'Maria "Lightning" Santos',
				avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=ef4444&color=fff',
				level: 12,
				experience: 11200,
				coins: 2100,
			},
			{
				email: 'david.quiz@example.com',
				username: 'QuizMaster',
				password: '$2a$10$dVPbCv8K6JQ4K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', // placeholder hash
				displayName: 'David "Brain" Chen',
				avatar: 'https://ui-avatars.com/api/?name=David+Chen&background=22c55e&color=fff',
				level: 18,
				experience: 17800,
				coins: 3200,
			},
			{
				email: 'sarah.tower@example.com',
				username: 'TowerQueen',
				password: '$2a$10$dVPbCv8K6JQ4K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', // placeholder hash
				displayName: 'Sarah "Fortress" Johnson',
				avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=a855f7&color=fff',
				level: 14,
				experience: 13600,
				coins: 2650,
			},
			{
				email: 'mike.gamer@example.com',
				username: 'MikeGamer',
				password: '$2a$10$dVPbCv8K6JQ4K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', // placeholder hash
				displayName: 'Mike "AllRound" Wilson',
				avatar: 'https://ui-avatars.com/api/?name=Mike+Wilson&background=f59e0b&color=fff',
				level: 10,
				experience: 9500,
				coins: 1800,
			},
			{
				email: 'emma.pro@example.com',
				username: 'EmmaProGamer',
				password: '$2a$10$dVPbCv8K6JQ4K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', // placeholder hash
				displayName: 'Emma "Pro" Taylor',
				avatar: 'https://ui-avatars.com/api/?name=Emma+Taylor&background=ec4899&color=fff',
				level: 20,
				experience: 19800,
				coins: 3800,
			},
			{
				email: 'jack.rookie@example.com',
				username: 'RookieJack',
				password: '$2a$10$dVPbCv8K6JQ4K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', // placeholder hash
				displayName: 'Jack "Rookie" Miller',
				avatar: 'https://ui-avatars.com/api/?name=Jack+Miller&background=14b8a6&color=fff',
				level: 3,
				experience: 2100,
				coins: 420,
			},
			{
				email: 'lucy.gamer@example.com',
				username: 'LuckyLucy',
				password: '$2a$10$dVPbCv8K6JQ4K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', // placeholder hash
				displayName: 'Lucy "Lucky" Brown',
				avatar: 'https://ui-avatars.com/api/?name=Lucy+Brown&background=8b5cf6&color=fff',
				level: 8,
				experience: 7200,
				coins: 1440,
			},
		];

		for (const userData of sampleUsers) {
			await prisma.user.create({
				data: userData,
			});
		}

		// Refresh users list
		users = await prisma.user.findMany();
		console.log(`✅ Created ${users.length} sample users`);
	}

	console.log('Creating test game sessions and results...');

	// Create test sessions for each game type
	const gameTypes = [shooter, race, quiz, towerDefence];
	const sessionIds = [];

	for (let gameTypeIndex = 0; gameTypeIndex < gameTypes.length; gameTypeIndex++) {
		const gameType = gameTypes[gameTypeIndex];
		
		// Create 2-3 sessions per game type
		const sessionsToCreate = Math.floor(Math.random() * 2) + 2;
		
		for (let i = 0; i < sessionsToCreate; i++) {
			// Pick random host
			const host = users[Math.floor(Math.random() * users.length)];
			
			// Create game room
			const roomId = `test-${gameType.code}-${i}-${Date.now()}`;
			const gameRoom = await prisma.gameRoom.create({
				data: {
					roomId,
					name: `Test ${gameType.name} Room ${i + 1}`,
					gameTypeId: gameType.id,
					hostId: host.id,
					maxPlayers: gameType.maxPlayers,
					currentPlayers: Math.min(users.length, gameType.maxPlayers),
					hasPassword: false,
					status: 'finished',
					config: {},
					closedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
				},
			});

			// Create game session
			const sessionDuration = Math.floor(Math.random() * 600) + 180; // 3-13 minutes
			const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
			const endTime = new Date(startTime.getTime() + sessionDuration * 1000);

			const session = await prisma.gameSession.create({
				data: {
					gameRoomId: gameRoom.id,
					gameTypeId: gameType.id,
					hostId: host.id,
					status: 'completed',
					startedAt: startTime,
					endedAt: endTime,
					duration: sessionDuration,
					gameData: {
						rounds: gameType.code === 'quiz' ? 5 : null,
						difficulty: gameType.difficulty,
					},
				},
			});

			sessionIds.push(session.id);

			// Select random players for this session (2-maxPlayers)
			const playersCount = Math.min(
				Math.floor(Math.random() * (gameType.maxPlayers - 1)) + 2,
				users.length
			);
			const sessionPlayers = [...users]
				.sort(() => Math.random() - 0.5)
				.slice(0, playersCount);

			// Create results for each player
			for (let j = 0; j < sessionPlayers.length; j++) {
				const player = sessionPlayers[j];
				const rank = j + 1;
				
				// Generate game-specific stats
				let gameResult = {
					sessionId: session.id,
					playerId: player.id,
					playerName: player.displayName,
					rank,
				};

				switch (gameType.code) {
					case 'quiz':
						const totalQuestions = 5;
						const correctAnswers = Math.max(0, totalQuestions - rank);
						gameResult.questionsTotal = totalQuestions;
						gameResult.questionsRight = correctAnswers;
						gameResult.score = correctAnswers * 100 + Math.floor(Math.random() * 50);
						gameResult.performance = {
							accuracy: (correctAnswers / totalQuestions) * 100,
							avgResponseTime: Math.random() * 5 + 2,
						};
						break;

					case 'shooter':
						const kills = Math.max(1, 20 - rank * 3 + Math.floor(Math.random() * 5));
						const deaths = rank + Math.floor(Math.random() * 5);
						gameResult.kills = kills;
						gameResult.deaths = deaths;
						gameResult.score = kills * 100 - deaths * 10;
						gameResult.performance = {
							kd: kills / Math.max(1, deaths),
							accuracy: Math.random() * 0.4 + 0.3,
						};
						break;

					case 'race':
						const lapTime = 30000 + rank * 5000 + Math.floor(Math.random() * 3000);
						gameResult.lapTime = lapTime;
						gameResult.score = Math.floor(100000 / lapTime);
						gameResult.performance = {
							topSpeed: Math.random() * 100 + 150,
							avgSpeed: Math.random() * 50 + 100,
						};
						break;

					case 'towerdefence':
						const wavesCompleted = Math.max(1, 10 - rank + Math.floor(Math.random() * 3));
						gameResult.score = wavesCompleted * 500 + Math.floor(Math.random() * 200);
						gameResult.performance = {
							wavesCompleted,
							towersBuilt: Math.floor(Math.random() * 20) + 10,
							enemiesKilled: wavesCompleted * 15,
						};
						break;
				}

				// Create game result
				await prisma.gameResult.create({
					data: gameResult,
				});
			}

			console.log(`✅ Created session for ${gameType.name} with ${sessionPlayers.length} players`);
		}
	}

	console.log('Creating/updating player statistics...');

	// Calculate and create player stats for each user and game type
	for (const user of users) {
		for (const gameType of gameTypes) {
			// Get all results for this user and game type
			const userResults = await prisma.gameResult.findMany({
				where: {
					playerId: user.id,
					session: {
						gameTypeId: gameType.id,
					},
				},
				include: {
					session: true,
				},
			});

			if (userResults.length === 0) continue;

			// Calculate stats
			const gamesPlayed = userResults.length;
			const gamesWon = userResults.filter((r) => r.rank === 1).length;
			const gamesLost = gamesPlayed - gamesWon;
			const totalScore = userResults.reduce((sum, r) => sum + (r.score || 0), 0);
			const highestScore = Math.max(...userResults.map((r) => r.score || 0));
			const averageScore = totalScore / gamesPlayed;
			const winRate = (gamesWon / gamesPlayed) * 100;

			// Game-specific stats
			const totalKills = userResults.reduce((sum, r) => sum + (r.kills || 0), 0);
			const totalDeaths = userResults.reduce((sum, r) => sum + (r.deaths || 0), 0);
			const lapTimes = userResults.filter((r) => r.lapTime).map((r) => r.lapTime);
			const bestLapTime = lapTimes.length > 0 ? Math.min(...lapTimes) : null;
			const totalRaceTime = lapTimes.reduce((sum, t) => sum + t, 0);
			const questionsAnswered = userResults.reduce((sum, r) => sum + (r.questionsTotal || 0), 0);
			const questionsCorrect = userResults.reduce((sum, r) => sum + (r.questionsRight || 0), 0);
			const averageRank = userResults.reduce((sum, r) => sum + (r.rank || 0), 0) / gamesPlayed;

			// Create or update player stats
			await prisma.playerStats.upsert({
				where: {
					userId_gameTypeId: {
						userId: user.id,
						gameTypeId: gameType.id,
					},
				},
				update: {
					gamesPlayed,
					gamesWon,
					gamesLost,
					totalScore,
					highestScore,
					averageScore,
					totalKills,
					totalDeaths,
					bestLapTime,
					totalRaceTime,
					questionsAnswered,
					questionsCorrect,
					winRate,
					averageRank,
					lastPlayedAt: new Date(),
				},
				create: {
					userId: user.id,
					gameTypeId: gameType.id,
					gamesPlayed,
					gamesWon,
					gamesLost,
					totalScore,
					highestScore,
					averageScore,
					totalKills,
					totalDeaths,
					bestLapTime,
					totalRaceTime,
					questionsAnswered,
					questionsCorrect,
					winRate,
					averageRank,
					lastPlayedAt: new Date(),
				},
			});

			console.log(`✅ Stats created for ${user.username} in ${gameType.name}`);
		}

		// Update user level and experience based on total score
		const allUserStats = await prisma.playerStats.findMany({
			where: { userId: user.id },
		});

		const totalScore = allUserStats.reduce((sum, s) => sum + s.totalScore, 0);
		const experience = Math.floor(totalScore / 10);
		const level = Math.floor(experience / 1000) + 1;

		await prisma.user.update({
			where: { id: user.id },
			data: {
				experience,
				level,
				coins: Math.floor(totalScore / 50),
			},
		});

		console.log(`✅ Updated ${user.username}: Level ${level}, ${experience} XP`);
	}

	console.log('Creating user achievements...');

	// Award achievements based on stats
	for (const user of users) {
		const userStats = await prisma.playerStats.findMany({
			where: { userId: user.id },
		});

		const totalWins = userStats.reduce((sum, s) => sum + s.gamesWon, 0);
		const totalGames = userStats.reduce((sum, s) => sum + s.gamesPlayed, 0);
		const totalKills = userStats.reduce((sum, s) => sum + (s.totalKills || 0), 0);

		// Award "First Victory" if user has any wins
		if (totalWins > 0) {
			const firstWinAchievement = achievements.find((a) => a.code === 'first_win');
			await prisma.userAchievement.upsert({
				where: {
					userId_achievementId: {
						userId: user.id,
						achievementId: (await prisma.achievement.findUnique({ where: { code: 'first_win' } })).id,
					},
				},
				update: {},
				create: {
					userId: user.id,
					achievementId: (await prisma.achievement.findUnique({ where: { code: 'first_win' } })).id,
					unlockedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
				},
			});
		}

		// Award "Sharp Shooter" if user has 50+ kills
		if (totalKills >= 50) {
			await prisma.userAchievement.upsert({
				where: {
					userId_achievementId: {
						userId: user.id,
						achievementId: (await prisma.achievement.findUnique({ where: { code: 'sharp_shooter' } })).id,
					},
				},
				update: {},
				create: {
					userId: user.id,
					achievementId: (await prisma.achievement.findUnique({ where: { code: 'sharp_shooter' } })).id,
					unlockedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
				},
			});
		}

		// Award "Marathon Runner" if user has 100+ games
		if (totalGames >= 100) {
			await prisma.userAchievement.upsert({
				where: {
					userId_achievementId: {
						userId: user.id,
						achievementId: (await prisma.achievement.findUnique({ where: { code: 'marathon_runner' } })).id,
					},
				},
				update: {},
				create: {
					userId: user.id,
					achievementId: (await prisma.achievement.findUnique({ where: { code: 'marathon_runner' } })).id,
					unlockedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
				},
			});
		}

		console.log(`✅ Achievements awarded to ${user.username}`);
	}

	console.log('🎉 Database seeding completed with test data!');
	console.log(`📊 Summary:`);
	console.log(`   - ${users.length} users`);
	console.log(`   - ${gameTypes.length} game types`);
	console.log(`   - ${sessionIds.length} game sessions`);
	console.log(`   - Multiple player stats and achievements created`);
}

main()
	.catch((e) => {
		console.error('❌ Error seeding database:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

