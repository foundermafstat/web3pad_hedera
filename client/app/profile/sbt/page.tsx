'use client';

import { PageWithFooter } from '@/components/PageWithFooter';
import { PlayerSBTMint } from '@/components/profile/PlayerSBTMint';

export default function ProfileSbtMintPage() {
  return (
    <PageWithFooter>
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">Player SBT</h1>
              <p className="text-gray-300">Mint your non-transferable identity token</p>
            </div>

            <PlayerSBTMint />
          </div>
        </div>
      </div>
    </PageWithFooter>
  );
}


