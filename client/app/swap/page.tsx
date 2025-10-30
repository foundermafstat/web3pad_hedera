'use client';

import { useState, useEffect } from 'react';
import { SwapInterface } from '@/components/swap/SwapInterface';
import { PageWithFooter } from '@/components/PageWithFooter';

export default function SwapPage() {
	return (
		<PageWithFooter>
			<div className="min-h-screen bg-background pt-16">
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-7xl mx-auto">
						{/* Header */}
						<div className="text-center mb-8">
							<h1 className="text-4xl font-bold text-white mb-4">Token Swap</h1>
							<p className="text-xl text-gray-300">
								Swap HBAR for HPLAY via smart contracts
							</p>
						</div>

						{/* Swap Interface */}
						<SwapInterface />
					</div>
				</div>
			</div>
		</PageWithFooter>
	);
}
