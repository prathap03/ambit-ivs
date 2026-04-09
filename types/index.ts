export interface Bank {
  id: string;
  bank_name: string;
  bank_code: string;
  bank_logo_url: string;
  bank_opinion_amount: number;
  bank_vetting_amount: number;
  bank_modt_amount: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_name: string;
  bank_company_name: string;
  date: string;
  file_number: string;
  opinion: boolean;
  opinion_amount: number | null;
  vetting: boolean;
  vetting_amount: number | null;
  modt: boolean;
  modt_amount: number | null;
  total_amount: number;
}
