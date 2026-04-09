export interface NavItem {
  name: string;
  superAdminOnly?: boolean;
}

const data: NavItem[] = [
  { name: "home" },
  { name: "analytics" },
  { name: "invoices" },
  { name: "settings" },
  { name: "users", superAdminOnly: true },
];

export default data;
