import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { useState } from 'react';


const YearMonthPicker = ({ selectedYear, selectedMonth, onChange }: { selectedYear: number, selectedMonth: number, onChange: (data: { year: number, month: number }) => void }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
  ];

  const [year, setYear] = useState(selectedYear || currentYear);
  const [month, setMonth] = useState(selectedMonth || new Date().getMonth());

  const handleYearChange = (increment: number): void => {
    setYear((prev: number) => prev + increment);
  };

  const handleMonthSelect = (monthIndex: number): void => {
    setMonth(monthIndex);
    onChange && onChange({ year, month: monthIndex });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="px-4 py-1 md:text-[1rem] text-[0.8rem] bg-blue-500 shadow-md text-white rounded-md">
          {months[month]} | {year}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-4  w-content z-10 bg-white shadow-md md:w-[35vw] w-[45vw] rounded-md">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => handleYearChange(-1)}>
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold">{year}</span>
          <button onClick={() => handleYearChange(1)}>
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {months.map((monthName, index) => (
            <button
              key={index}
              className={`md:p-2 p-1 text-[0.45rem] md:text-[1rem] md:w-[10vw] w-[12vw] rounded-md text-center ${
                index === month ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
              onClick={() => handleMonthSelect(index)}
            >
              {monthName}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default YearMonthPicker;
