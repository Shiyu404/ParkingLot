import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export function VisitorPass({ plate, timeRemaining, passType }) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">车牌号：</span>
          <span className="text-sm">{plate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">剩余时间：</span>
          <span className="text-sm">{timeRemaining}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">通行证类型：</span>
          <span className="text-sm">{passType}</span>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            toast({
              title: "功能开发中",
              description: "撤销通行证功能即将推出。",
            });
          }}
        >
          撤销通行证
        </Button>
      </div>
    </div>
  );
} 