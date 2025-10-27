'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FaSpinner, FaUpload, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { uploadToIPFS, uploadMetadataToIPFS, getIPFSUrl } from '@/lib/ipfs-client';

export default function NFTTestComponent() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    imageHash: string;
    metadataHash: string;
    imageUrl: string;
    metadataUrl: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testIPFSUpload = async () => {
    setIsUploading(true);
    setError(null);
    
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('IPFS upload only available in browser');
      }

      // Create a test image (1x1 pixel PNG)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 1, 1);
      }
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      });

      // Upload test image
      console.log('Uploading test image to IPFS...');
      const imageHash = await uploadToIPFS(blob);
      const imageUrl = getIPFSUrl(imageHash);
      console.log('Image uploaded:', { imageHash, imageUrl });

      // Create test metadata
      const metadata = {
        name: 'Test NFT',
        description: 'This is a test NFT for IPFS integration',
        image: imageUrl,
        attributes: [
          { trait_type: 'Test', value: 'IPFS Upload' },
          { trait_type: 'Timestamp', value: Date.now() },
        ],
      };

      // Upload metadata
      console.log('Uploading metadata to IPFS...');
      const metadataHash = await uploadMetadataToIPFS(metadata);
      const metadataUrl = getIPFSUrl(metadataHash);
      console.log('Metadata uploaded:', { metadataHash, metadataUrl });

      setUploadResult({
        imageHash,
        metadataHash,
        imageUrl,
        metadataUrl,
      });

    } catch (err) {
      console.error('IPFS upload error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const clearResults = () => {
    setUploadResult(null);
    setError(null);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaUpload className="h-5 w-5" />
          IPFS integration test
        </CardTitle>
        <CardDescription>
          Verify IPFS using your Filebase API key
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadResult && !error && (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Click the button below to test uploading to IPFS
            </p>
            <Button
              onClick={testIPFSUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                  Testing IPFS...
                </>
              ) : (
                'Test IPFS'
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <FaTimes className="h-4 w-4" />
              <span className="font-medium">Upload error</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearResults}
              className="mt-2"
            >
              Try again
            </Button>
          </div>
        )}

        {uploadResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-800">
              <FaCheckCircle className="h-4 w-4" />
              <span className="font-medium">IPFS upload successful!</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Image</h4>
                <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                  <p className="text-sm">
                    <strong>Hash:</strong> {uploadResult.imageHash}
                  </p>
                  <p className="text-sm">
                    <strong>URL:</strong>{' '}
                    <a
                      href={uploadResult.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all"
                    >
                      {uploadResult.imageUrl}
                    </a>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Metadata</h4>
                <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                  <p className="text-sm">
                    <strong>Hash:</strong> {uploadResult.metadataHash}
                  </p>
                  <p className="text-sm">
                    <strong>URL:</strong>{' '}
                    <a
                      href={uploadResult.metadataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all"
                    >
                      {uploadResult.metadataUrl}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(uploadResult.imageUrl, '_blank')}
              >
                Open image
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(uploadResult.metadataUrl, '_blank')}
              >
                Open metadata
              </Button>
              <Button variant="outline" onClick={clearResults}>
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
