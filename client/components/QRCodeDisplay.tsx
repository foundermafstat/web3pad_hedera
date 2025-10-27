'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
	url: string;
	size?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ url, size = 200 }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (canvasRef.current && url && url.trim() !== '') {
			QRCode.toCanvas(
				canvasRef.current,
				url,
				{
					width: size,
					margin: 1,
					color: {
						dark: '#1f2937',
						light: '#FFFFFF',
					},
				},
				(error) => {
					if (error) console.error('QR Code generation failed:', error);
				}
			);
		}
	}, [url, size]);

	return (
		<div className="text-center">
			<div className="inline-block p-2 bg-white rounded-lg shadow-lg">
				<canvas ref={canvasRef} />
			</div>
			{/* <p className="text-gray-300 text-sm mt-3">
				Scan with mobile device to join
			</p>
			<div className="mt-2 p-2 bg-gray-700/50 rounded-md">
				<p className="text-gray-400 text-xs break-all">{url}</p>
			</div> */}
		</div>
	);
};

export default QRCodeDisplay;
