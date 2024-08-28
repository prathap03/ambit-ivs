import Image from "next/image";
import Link from "next/link";

const banks = [
  { name: "Jana Small Finance Bank", logo: "https://upload.wikimedia.org/wikipedia/en/5/5f/Logo_of_Jana_Small_Finance_Bank.jpg?20240303000236" },
  { name: "Equitas Small Finance", logo: "https://i.pinimg.com/736x/57/00/4e/57004e3e06f40675f3a3dfebdf60bda6.jpg" },
  { name: "HDFC", logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg" },
  { name: "State Bank of India", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/State_Bank_of_India.svg/175px-State_Bank_of_India.svg.png" },
  { name: "Canara Bank", logo: "https://cdn.freelogovectors.net/wp-content/uploads/2023/10/canara-bank-logo-freelogovectors.net_-640x400.png" },
  { name: "Indian Bank", logo: "https://upload.wikimedia.org/wikipedia/en/b/bc/Indian_Bank_logo.svg" },
  { name: "IndusInd Bank Limited", logo: "https://www.vgc.in/assets/2018/08/Ind-card-1.jpg" },
  { name: "CANFIN Homes Limited", logo: "https://images.jdmagicbox.com/v2/comp/delhi/41/011p64841/catalogue/can-fin-homes-ltd-nehru-place-delhi-finance-companies-3ddrokc.jpg" },
  { name: "General Legal Opinions", logo: "/images/general.png" },
  {name:"Ambit", logo: "https://logodix.com/logo/2000264.jpg"}
];

banks.sort((a, b) => a.name.localeCompare(b.name));

export default function CardList() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-4">
      {banks.map((bank, index) => (
        <Link  key={index} href={`/dashboard/${bank.name}`}>
              <div
         
          className="flex flex-col  items-center hover:scale-[105%] transition-all ease-in-out justify-center h-[8rem]  bg-white dark:bg-gray-800  rounded-lg shadow-md hover:shadow-lg hover:cursor-pointer group"
        >
          <div className="overflow-hidden  rounded-t-lg  justify-center max-h-[8rem]  w-[100%] flex flex-grow">
          <Image
            src={bank.logo}
            alt={`${bank.name} logo`}
            width={100}
            height={100}
            className=" object-fill  w-[100%] "
          />
          </div>
          <h3 className="text-center group-hover:bg-blue-500 transition-all ease-linear  rounded-b-lg bg-black w-[100%] text-lg font-semibold text-white dark:text-white">
            {bank.name}
          </h3>
        </div>
        </Link>
      ))}
    </div>
  );
}
