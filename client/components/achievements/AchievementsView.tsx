'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaTrophy, FaMedal, FaStar, FaLock, FaBullseye, FaUsers, FaGamepad, FaBolt, FaAward, FaCrown, FaGem } from 'react-icons/fa';

interface Achievement {
	id: string;
	code: string;
	name: string;
	description: string;
	icon?: string;
	category: string;
	points: number;
	criteria: any;
	isActive: boolean;
	unlockedAt?: string;
	progress?: number;
	maxProgress?: number;
}

const mockAchievements: Achievement[] = [
	{
		id: '1',
		code: 'first_win',
		name: 'First Victory',
		description: 'Win your first game',
		category: 'gameplay',
		points: 10,
		criteria: { wins: 1 },
		isActive: true,
		unlockedAt: '2024-01-15T10:30:00Z',
		progress: 1,
		maxProgress: 1,
	},
	{
		id: '2',
		code: 'perfectionist',
		name: 'Perfectionist',
		description: 'Get a perfect score in Quiz Battle',
		category: 'gameplay',
		points: 25,
		criteria: { correctAnswers: '100%' },
		isActive: true,
		progress: 0,
		maxProgress: 1,
	},
	{
		id: '3',
		code: 'speed_demon',
		name: 'Speed Demon',
		description: 'Complete a race in under 60 seconds',
		category: 'gameplay',
		points: 20,
		criteria: { lapTime: { less: 60000 } },
		isActive: true,
		unlockedAt: '2024-01-16T14:20:00Z',
		progress: 1,
		maxProgress: 1,
	},
	{
		id: '4',
		code: 'social_butterfly',
		name: 'Social Butterfly',
		description: 'Play with 10 different players',
		category: 'social',
		points: 15,
		criteria: { uniquePlayers: 10 },
		isActive: true,
		progress: 7,
		maxProgress: 10,
	},
	{
		id: '5',
		code: 'marathon_runner',
		name: 'Marathon Runner',
		description: 'Play 100 games',
		category: 'gameplay',
		points: 50,
		criteria: { gamesPlayed: 100 },
		isActive: true,
		progress: 45,
		maxProgress: 100,
	},
	{
		id: '6',
		code: 'sharp_shooter',
		name: 'Sharp Shooter',
		description: 'Get 50 accurate kills in shooters',
		category: 'gameplay',
		points: 30,
		criteria: { totalKills: 50 },
		isActive: true,
		unlockedAt: '2024-01-18T09:15:00Z',
		progress: 50,
		maxProgress: 50,
	},
	{
		id: '7',
		code: 'quiz_master',
		name: 'Quiz Master',
		description: 'Answer 500 questions correctly',
		category: 'education',
		points: 40,
		criteria: { correctAnswers: 500 },
		isActive: true,
		progress: 234,
		maxProgress: 500,
	},
	{
		id: '8',
		code: 'tower_defender',
		name: 'Tower Defender',
		description: 'Defend against 20 waves of enemies in Tower Defence',
		category: 'strategy',
		points: 35,
		criteria: { wavesDefended: 20 },
		isActive: true,
		progress: 12,
		maxProgress: 20,
	},
	{
		id: '9',
		code: 'collector',
		name: 'Collector',
		description: 'Unlock 10 achievements',
		category: 'collection',
		points: 25,
		criteria: { achievements: 10 },
		isActive: true,
		progress: 3,
		maxProgress: 10,
	},
	{
		id: '10',
		code: 'legend',
		name: 'Legend',
		description: 'Earn 1000 achievement points',
		category: 'prestige',
		points: 100,
		criteria: { achievementPoints: 1000 },
		isActive: true,
		progress: 180,
		maxProgress: 1000,
	},
];

export function AchievementsView() {
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
	const [categoryFilter, setCategoryFilter] = useState<string>('all');

	useEffect(() => {
		// Mock API call - replace with actual API
		setTimeout(() => {
			setAchievements(mockAchievements);
			setLoading(false);
		}, 500);
	}, []);

	const categories = [
		{ id: 'all', name: 'All Categories', icon: Trophy },
		{ id: 'gameplay', name: 'Gameplay', icon: FaGamepad },
		{ id: 'social', name: 'Social', icon: Users },
		{ id: 'education', name: 'Education', icon: Award },
		{ id: 'strategy', name: 'Strategy', icon: Target },
		{ id: 'collection', name: 'Collection', icon: FaGem },
		{ id: 'prestige', name: 'Prestige', icon: Crown },
	];

	const filteredAchievements = achievements.filter((achievement) => {
		const statusMatch = filter === 'all' || 
			(filter === 'unlocked' && achievement.unlockedAt) ||
			(filter === 'locked' && !achievement.unlockedAt);
		
		const categoryMatch = categoryFilter === 'all' || achievement.category === categoryFilter;
		
		return statusMatch && categoryMatch;
	});

	const unlockedCount = achievements.filter(a => a.unlockedAt).length;
	const totalPoints = achievements.filter(a => a.unlockedAt).reduce((sum, a) => sum + a.points, 0);

	const getCategoryIcon = (category: string) => {
		const categoryData = categories.find(c => c.id === category);
		return categoryData?.icon || Trophy;
	};

	const getRarityColor = (points: number) => {
		if (points >= 50) return 'text-purple-500 border-purple-500/20 bg-purple-500/10';
		if (points >= 30) return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
		if (points >= 20) return 'text-green-500 border-green-500/20 bg-green-500/10';
		return 'text-gray-500 border-gray-500/20 bg-gray-500/10';
	};

	if (loading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Card key={i} className="animate-pulse">
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-muted rounded-md" />
								<div className="space-y-2 flex-1">
									<div className="h-4 bg-muted rounded w-3/4" />
									<div className="h-3 bg-muted rounded w-full" />
								</div>
							</div>
						</CardHeader>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div>
			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-md bg-yellow-500/10 flex items-center justify-center">
								<FaTrophy className="w-6 h-6 text-yellow-500" />
							</div>
							<div>
								<p className="text-2xl font-bold">{unlockedCount}</p>
								<p className="text-sm text-muted-foreground">Unlocked</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-md bg-blue-500/10 flex items-center justify-center">
								<FaStar className="w-6 h-6 text-blue-500" />
							</div>
							<div>
								<p className="text-2xl font-bold">{totalPoints}</p>
								<p className="text-sm text-muted-foreground">Points Earned</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-md bg-green-500/10 flex items-center justify-center">
								<FaMedal className="w-6 h-6 text-green-500" />
							</div>
							<div>
								<p className="text-2xl font-bold">{Math.round((unlockedCount / achievements.length) * 100)}%</p>
								<p className="text-sm text-muted-foreground">Progress</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="all">All Achievements</TabsTrigger>
					<TabsTrigger value="unlocked">Unlocked</TabsTrigger>
					<TabsTrigger value="locked">Locked</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* Category Filters */}
			<div className="flex flex-wrap gap-3 mb-8">
				{categories.map((category) => {
					const Icon = category.icon;
					return (
						<Button
							key={category.id}
							variant={categoryFilter === category.id ? 'default' : 'outline'}
							onClick={() => setCategoryFilter(category.id)}
							size="sm"
							className="gap-2"
						>
							<Icon className="w-4 h-4" />
							{category.name}
						</Button>
					);
				})}
			</div>

			{/* Achievements Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredAchievements.map((achievement) => {
					const CategoryIcon = getCategoryIcon(achievement.category);
					const isUnlocked = !!achievement.unlockedAt;
					const hasProgress = achievement.progress !== undefined && achievement.maxProgress !== undefined;
					const progressPercent = hasProgress ? (achievement.progress! / achievement.maxProgress!) * 100 : 0;

					return (
						<Card 
							key={achievement.id} 
							className={`relative overflow-hidden transition-all ${
								isUnlocked 
									? 'hover:shadow-lg border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent' 
									: 'opacity-75 hover:opacity-90'
							}`}
						>
							{isUnlocked && (
								<div className="absolute top-2 right-2">
									<div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
										<FaTrophy className="w-4 h-4 text-white" />
									</div>
								</div>
							)}
							
							{!isUnlocked && (
								<div className="absolute top-2 right-2">
									<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
										<FaLock className="w-4 h-4 text-muted-foreground" />
									</div>
								</div>
							)}

							<CardHeader>
								<div className="flex items-start gap-3">
									<div className={`w-12 h-12 rounded-md border flex items-center justify-center ${
										isUnlocked 
											? 'border-yellow-500/20 bg-yellow-500/10' 
											: 'border-muted bg-muted'
									}`}>
										{achievement.icon ? (
											<span className="text-2xl">{achievement.icon}</span>
										) : (
											<CategoryIcon className={`w-6 h-6 ${
												isUnlocked ? 'text-yellow-500' : 'text-muted-foreground'
											}`} />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<CardTitle className={`text-lg ${
											!isUnlocked ? 'text-muted-foreground' : ''
										}`}>
											{achievement.name}
										</CardTitle>
										<CardDescription className="mt-1">
											{achievement.description}
										</CardDescription>
									</div>
								</div>
							</CardHeader>

							<CardContent>
								<div className="space-y-4">
									{/* Progress Bar */}
									{hasProgress && !isUnlocked && (
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Progress</span>
												<span className="font-medium">
													{achievement.progress}/{achievement.maxProgress}
												</span>
											</div>
											<Progress value={progressPercent} className="h-2" />
										</div>
									)}

									{/* Achievement Details */}
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Badge variant="outline" className="text-xs">
												{achievement.category}
											</Badge>
											<Badge 
												className={`text-xs ${getRarityColor(achievement.points)}`}
											>
												{achievement.points} points
											</Badge>
										</div>
										
										{isUnlocked && achievement.unlockedAt && (
											<div className="text-xs text-muted-foreground">
												{new Date(achievement.unlockedAt).toLocaleDateString('en-US')}
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{filteredAchievements.length === 0 && (
				<div className="text-center py-12">
					<FaTrophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-semibold mb-2">No Achievements Found</h3>
					<p className="text-muted-foreground">
						Try changing the filters or start playing to unlock rewards
					</p>
				</div>
			)}
		</div>
	);
}