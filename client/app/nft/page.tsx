'use client';

import dynamic from 'next/dynamic';
import { PageWithFooter } from '@/components/PageWithFooter';

// Dynamic import to avoid SSR issues with IPFS
const NFTPageClient = dynamic(() => import('@/components/nft/NFTPageClient'), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto px-4 py-8 ">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading NFT page...</p>
        </div>
      </div>
    </div>
  ),
});

export default function NFTPage() {
  return (
    <PageWithFooter>
      <NFTPageClient />
    </PageWithFooter>
  );
}
