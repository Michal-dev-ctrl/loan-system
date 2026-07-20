export type DepositOption = "cheque" | "cash" | null;

export type PersonalDetails = {
  firstName: string;
  lastName: string;
  phone1: string;
  phone2: string;
};

export type DepositDetails = {
  option: DepositOption;
  chequeName: string;
  chequeNumber: string;
  depositAmount: number;
  donationAmount: number;
};

export type DatesDetails = {
  pickupDate: string;
  returnDate: string;
};

export type RentalTotals = {
  donation: number;
  depositAmount: number;
  purchaseTotal: number;
  rentalTotal: number;
  totalToPayNow: number;
};

export type DamageLine = {
  id: string;
  name: string;
  missing: number;
  price: number;
  lineTotal: number;
};

export type ReturnDetails = {
  completedAt: string;
  returnedQuantities: Record<string, number>;
  chuppahReturned?: Record<string, boolean>;
  otherDamageName?: string;
  otherDamageAmount?: number;
  damageTotal: number;
  damageBreakdown: DamageLine[];
};

export type SavedRental = {
  id: string;
  createdAt: string;
  personal: PersonalDetails;
  deposit: DepositDetails;
  dates: DatesDetails;
  items: Record<string, number>;
  totals: RentalTotals;
  notes?: string;
  extraChargeAmount?: number;
  returnCompleted?: boolean;
  returnDetails?: ReturnDetails;
};

export type CreateRentalInput = Omit<
  SavedRental,
  "id" | "createdAt" | "returnCompleted" | "returnDetails"
> & {
  id?: string;
};

export type UpdateRentalInput = Partial<
  Omit<SavedRental, "id" | "createdAt">
>;
