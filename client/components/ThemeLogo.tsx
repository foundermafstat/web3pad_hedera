/**
 * Universal W3P Logo Component
 * 
 * Usage examples:
 * - Basic: <ThemeLogo />
 * - Custom size: <ThemeLogo width={120} height={78} />
 * - With CSS class: <ThemeLogo className="w3p-logo-lg w3p-logo-primary" />
 * - Custom color: <ThemeLogo color="#ff6b6b" />
 * - CSS-only sizing: <ThemeLogo className="w3p-logo-xl" />
 */
interface ThemeLogoProps {
	width?: number;
	height?: number;
	className?: string;
	color?: string;
	style?: React.CSSProperties;
}

export function ThemeLogo({ 
	width = 78, 
	height = 52, 
	className = '', 
	color = 'currentColor',
	style = {}
}: ThemeLogoProps) {
	const combinedStyle = {
		...(width && !className.includes('w-') && !className.includes('h-') ? { width: `${width}px` } : {}),
		...(height && !className.includes('w-') && !className.includes('h-') ? { height: `${height}px` } : {}),
		color: color,
		...style,
	};

	return (
		<svg
			viewBox="0 0 517 211"
			style={combinedStyle}
			className={`w3p-logo ${className}`}
			role="img"
			aria-label="W3P Logo"
		>
			<path 
				fill={color}
				opacity="1.00" 
				d="M 0.82 0.00 L 223.71 0.00 C 234.57 10.24 245.48 20.42 256.31 30.68 C 257.17 31.42 257.89 32.38 258.94 32.87 C 270.75 21.97 282.40 10.91 294.20 0.00 L 517.00 0.00 L 517.00 210.30 C 440.03 210.30 363.06 210.37 286.09 210.27 C 286.10 181.67 285.92 153.07 286.18 124.48 C 333.78 124.48 381.38 124.55 428.98 124.45 C 428.99 111.58 429.05 98.72 428.96 85.86 C 383.32 85.78 337.67 85.79 292.03 85.86 L 291.30 86.23 C 280.46 95.83 269.84 105.70 258.97 115.27 C 247.77 105.74 237.22 95.42 226.03 85.87 C 180.34 85.78 134.63 85.78 88.93 85.87 C 88.83 98.72 88.86 111.59 88.92 124.44 C 136.52 124.58 184.13 124.44 231.73 124.51 C 231.93 153.08 231.76 181.67 231.82 210.25 C 154.83 210.37 77.84 210.34 0.86 210.26 C 0.76 140.18 0.83 70.09 0.82 0.00 Z" 
			/>
		</svg>
	);
}
