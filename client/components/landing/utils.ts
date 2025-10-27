import { FaGamepad, FaBullseye, FaCar, FaBuilding } from 'react-icons/fa';

export const getGameIcon = (gameType: string) => {
	switch (gameType) {
		case 'shooter':
			return FaBullseye;
		case 'race':
			return FaCar;
		case 'towerdefence':
			return FaBuilding;
		default:
			return FaGamepad;
	}
};

export const getGameGradient = (index: number) => {
	const gradients = [
		'from-green-500 to-emerald-600',
		'from-purple-500 to-pink-600',
		'from-orange-500 to-red-600',
		'from-cyan-500 to-blue-600',
	];
	return gradients[index % gradients.length];
};
