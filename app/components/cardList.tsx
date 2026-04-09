import Image from "next/image";
import Link from "next/link";
import { Bank } from "@/types";

export default function CardList({ banks }: { banks: Array<Bank> }) {
  const sorted = [...banks].sort((a, b) => a.bank_name.localeCompare(b.bank_name));

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 p-5">
      {sorted.map((bank, index) => (
        <Link key={bank.id} href={`/dashboard/${bank.id}`}>
          <div
            className="group flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg dark:hover:shadow-indigo-900/20 transition-all duration-200 cursor-pointer overflow-hidden opacity-0 animate-fade-in"
            style={{ animationDelay: `${index * 0.07}s` }}
          >
            {/* Logo area */}
            <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 h-[6.5rem] overflow-hidden">
              <Image
                src={bank.bank_logo_url}
                alt={`${bank.bank_name} logo`}
                width={120}
                height={80}
                className="object-contain w-full h-full p-2"
              />
            </div>

            {/* Info area */}
            <div className="px-3 py-2.5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {bank.bank_name}
              </h3>
              {bank.bank_code && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-wide">
                  {bank.bank_code}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
