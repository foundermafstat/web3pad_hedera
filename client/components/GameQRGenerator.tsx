'use client';

import React, { useState, useEffect } from 'react';
import { FaQrcode, FaCopy, FaCheck } from 'react-icons/fa';

interface GameQRGeneratorProps {
  gameUrl: string;
  onClose?: () => void;
}

const GameQRGenerator: React.FC<GameQRGeneratorProps> = ({
  gameUrl,
  onClose
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate QR code URL for controller
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const controllerUrl = `${baseUrl}/play/${gameUrl}/controller`;
    setQrCodeUrl(controllerUrl);
  }, [gameUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold flex items-center gap-2">
          <FaQrcode className="w-5 h-5" />
          Game QR code
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        )}
      </div>

      <div className="text-center">
        {/* QR Code Placeholder */}
        <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FaQrcode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">QR code</p>
            <p className="text-gray-500 text-xs">Game: {gameUrl}</p>
          </div>
        </div>

        {/* URL Display */}
        <div className="bg-gray-700 rounded p-3 mb-4">
          <p className="text-gray-300 text-sm break-all">{qrCodeUrl}</p>
        </div>

        {/* Copy Button */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors mx-auto"
        >
          {copied ? (
            <>
              <FaCheck className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <FaCopy className="w-4 h-4" />
              Copy link
            </>
          )}
        </button>

        {/* Instructions */}
        <div className="mt-4 text-gray-400 text-sm">
          <p>Scan the QR code or follow the link</p>
          <p>to connect to the game</p>
        </div>
      </div>
    </div>
  );
};

export default GameQRGenerator;
