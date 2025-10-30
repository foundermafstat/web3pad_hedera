'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaList, FaBookOpen, FaGamepad, FaImage, FaCoins } from 'react-icons/fa';

interface ContractInfo {
  name: string;
  address: string;
  type: 'registry' | 'game' | 'nft' | 'ft';
  description: string;
  status: 'active' | 'inactive' | 'pending';
}

interface ContractManagerProps {
  contracts?: ContractInfo[];
}

const ContractManager: React.FC<ContractManagerProps> = ({ contracts = [] }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'registry':
        return <FaList className="w-5 h-5" />;
      case 'game':
        return <FaGamepad className="w-5 h-5" />;
      case 'nft':
        return <FaImage className="w-5 h-5" />;
      case 'ft':
        return <FaCoins className="w-5 h-5" />;
      default:
        return <FaBookOpen className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contract Manager</h2>
        <Badge variant="outline">{contracts.length} contracts</Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contracts.map((contract, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getIcon(contract.type)}
                  <CardTitle className="text-lg">{contract.name}</CardTitle>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(contract.status)}`} />
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                {contract.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs font-mono bg-muted p-2 rounded">
                  {contract.address}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {contract.type.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant={contract.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {contract.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {contracts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FaBookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No contracts found</p>
        </div>
      )}
    </div>
  );
};

export default ContractManager;
