"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const YearMonthPicker = ({
  selectedYear,
  selectedMonth,
  onChange,
}: {
  selectedYear: number;
  selectedMonth: number;
  onChange: (data: { year: number; month: number }) => void;
}) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(selectedYear || currentYear);
  const [month, setMonth] = useState(selectedMonth ?? new Date().getMonth());
  const [open, setOpen] = useState(false);

  const handleMonthSelect = (monthIndex: number) => {
    setMonth(monthIndex);
    onChange({ year, month: monthIndex });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors whitespace-nowrap">
          {MONTHS[month]} {year}
          <ChevronRightIcon className="w-3.5 h-3.5 opacity-70 rotate-90" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-3"
        align="end"
        sideOffset={6}
      >
        {/* Year navigation */}
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="text-base font-semibold text-gray-900 dark:text-white">{year}</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {MONTHS.map((name, index) => (
            <button
              key={index}
              onClick={() => handleMonthSelect(index)}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                index === month && year === selectedYear
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default YearMonthPicker;
