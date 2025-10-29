'use client';

import { useState, useEffect } from 'react';
import { SwapInterface } from '@/components/swap/SwapInterface';
import { PageWithFooter } from '@/components/PageWithFooter';

export default function SwapPage() {
  return (
    <PageWithFooter>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                Обмен токенов
              </h1>
              <p className="text-xl text-gray-300">
                Обменивайте HBAR на HPLAY токены через смарт-контракты
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
