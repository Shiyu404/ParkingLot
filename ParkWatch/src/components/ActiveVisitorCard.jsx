import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export function ActiveVisitorCard({ visitor }) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">License Plate:</span>
          <span className="text-sm">{visitor.plate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Time Remaining:</span>
          <span className="text-sm">{visitor.timeRemaining}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Pass Type:</span>
          <span className="text-sm">{visitor.passType}</span>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            toast({
              title: "Feature in Development",
              description: "The ability to revoke passes will be available soon.",
            });
          }}
        >
          Revoke Pass
        </Button>
      </div>
    </div>
  );
} 