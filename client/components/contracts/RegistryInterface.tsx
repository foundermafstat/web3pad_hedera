'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaList, FaPlus, FaSearch } from 'react-icons/fa';

interface RegistryInterfaceProps {
  onRegister?: () => void;
  onSearch?: (query: string) => void;
}

const RegistryInterface: React.FC<RegistryInterfaceProps> = ({ 
  onRegister, 
  onSearch 
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FaList className="w-5 h-5" />
          <CardTitle>Registry Interface</CardTitle>
        </div>
        <CardDescription>
          Manage game registrations and discover new games
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={onRegister} className="flex items-center gap-2">
            <FaPlus className="w-4 h-4" />
            Register Game
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FaSearch className="w-4 h-4" />
            Search Games
          </Button>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Recent Registrations</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">Shooter Game v1.0</span>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">Puzzle Game v2.1</span>
              <Badge variant="secondary">Active</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegistryInterface;
