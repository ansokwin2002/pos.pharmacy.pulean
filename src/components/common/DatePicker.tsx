'use client';

import React, { useState } from 'react';
import { Button, Popover } from '@radix-ui/themes';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  isInvalid?: boolean;
}

export default function DatePicker({ value, onChange, placeholder = 'Select a date', isInvalid }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setIsOpen(false);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <Button 
          variant="outline" 
          className={`w-full justify-start text-left font-normal ${isInvalid ? 'border-red-500' : ''}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-auto p-0">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={handleSelect}
          initialFocus
          classNames={{
            nav_button: 'text-orange-500',
            day_selected: 'bg-orange-500 text-white hover:bg-orange-600 focus:bg-orange-600',
            day_today: 'bg-gray-200 text-orange-900',
            day: 'text-orange-900 hover:bg-orange-100 focus:bg-orange-100',
            head_cell: 'text-orange-700',
            caption_label: 'text-orange-900 font-medium',
            day_outside: 'text-orange-300 opacity-50',
          }}
        />
      </Popover.Content>
    </Popover.Root>
  );
}
