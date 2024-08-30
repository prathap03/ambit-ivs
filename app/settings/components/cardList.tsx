import Image from "next/image";
import Link from "next/link";

interface Bank {
  id: any;
  bank_name: string;
  bank_logo_url: string;
  bank_code: string;
  bank_opinion_amount: number;
  bank_vetting_amount: number;
  bank_modtd_amount: number;
  created_at: Date;
}

export default function CardList({ banks }: { banks: Array<Bank> }) {
  banks.sort((a: any, b: any) => a.bank_name.localeCompare(b.bank_name));

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-4">
      {banks.map((bank, index) => (
        <Link key={index} href={`/settings/edit/${bank.id}`}>
          <div
            className={`flex flex-col items-center justify-center h-[8rem] bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg hover:cursor-pointer group transition-transform duration-150 ease-in-out hover:scale-[105%] 
            opacity-0 animate-fade-in delay-[${index * 100}ms]`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="overflow-hidden rounded-t-lg justify-center max-h-[8rem] w-[100%] flex flex-grow">
              <Image
                src={bank.bank_logo_url}
                alt={`${bank.bank_name} logo`}
                width={100}
                height={100}
                className="object-fill w-[100%]"
              />
            </div>
            <h3 className="text-center group-hover:bg-blue-500 transition-all ease-linear rounded-b-lg bg-black w-[100%] text-lg font-semibold text-white dark:text-white">
              {bank.bank_name}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
