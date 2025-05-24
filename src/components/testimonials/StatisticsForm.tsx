
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Statistics } from '@/types';
import { Loader2 } from 'lucide-react';

interface StatisticsFormProps {
  statistics: Statistics;
  onSave: (data: Statistics) => void;
  isLoading: boolean;
}

export default function StatisticsForm({
  statistics,
  onSave,
  isLoading
}: StatisticsFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset } = useForm<Statistics>({
    defaultValues: statistics
  });

  const handleSave = (data: Statistics) => {
    onSave(data);
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset(statistics);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Key Statistics</CardTitle>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(handleSave)} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Statistics
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-500">Training Programs</p>
            {isEditing ? (
              <Input 
                type="number" 
                {...register('programs_delivered', { valueAsNumber: true })}
                className="mt-1"
              />
            ) : (
              <p className="text-3xl font-bold">{statistics.programs_delivered}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">Programs Delivered</p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-500">Professionals</p>
            {isEditing ? (
              <Input 
                type="number" 
                {...register('professionals_trained', { valueAsNumber: true })}
                className="mt-1"
              />
            ) : (
              <p className="text-3xl font-bold">{statistics.professionals_trained}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">Professionals Trained</p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-500">Satisfaction Rate</p>
            {isEditing ? (
              <Input 
                type="number" 
                {...register('satisfaction_rate', { valueAsNumber: true })}
                className="mt-1"
                max="100"
              />
            ) : (
              <p className="text-3xl font-bold">{statistics.satisfaction_rate}%</p>
            )}
            <p className="text-xs text-slate-400 mt-1">Client Satisfaction</p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-500">Partners</p>
            {isEditing ? (
              <Input 
                type="number" 
                {...register('corporate_partners', { valueAsNumber: true })}
                className="mt-1"
              />
            ) : (
              <p className="text-3xl font-bold">{statistics.corporate_partners}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">Corporate Partners</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
