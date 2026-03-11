"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type PersonalDetails = {
  firstName: string;
  lastName: string;
  phone1: string;
  phone2: string;
};

type DepositOption = "cheque" | "cash" | null;

type DepositDetails = {
  option: DepositOption;
  chequeName: string;
  chequeNumber: string;
  depositAmount: number;
  donationAmount: number;
};

type DatesDetails = {
  pickupDate: string;
  returnDate: string;
};

type ItemsSelection = Record<string, number>;

type RentalDraft = {
  personal: PersonalDetails;
  deposit: DepositDetails;
  dates: DatesDetails;
  items: ItemsSelection;
};

type RentalContextValue = {
  draft: RentalDraft;
  updatePersonal: (update: Partial<PersonalDetails>) => void;
  updateDeposit: (update: Partial<DepositDetails>) => void;
  updateDates: (update: Partial<DatesDetails>) => void;
  setItemQuantity: (itemId: string, quantity: number) => void;
  resetDraft: () => void;
};

const defaultDraft: RentalDraft = {
  personal: {
    firstName: "",
    lastName: "",
    phone1: "",
    phone2: "",
  },
  deposit: {
    option: null,
    chequeName: "",
    chequeNumber: "",
    depositAmount: 0,
    donationAmount: 0,
  },
  dates: {
    pickupDate: "",
    returnDate: "",
  },
  items: {},
};

const RentalContext = createContext<RentalContextValue | undefined>(undefined);

export function RentalProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<RentalDraft>(defaultDraft);

  const updatePersonal = useCallback((update: Partial<PersonalDetails>) => {
    setDraft((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        ...update,
      },
    }));
  }, []);

  const updateDeposit = useCallback((update: Partial<DepositDetails>) => {
    setDraft((prev) => ({
      ...prev,
      deposit: {
        ...prev.deposit,
        ...update,
      },
    }));
  }, []);

  const updateDates = useCallback((update: Partial<DatesDetails>) => {
    setDraft((prev) => ({
      ...prev,
      dates: {
        ...prev.dates,
        ...update,
      },
    }));
  }, []);

  const setItemQuantity = useCallback((itemId: string, quantity: number) => {
    setDraft((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [itemId]: Math.max(0, quantity),
      },
    }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(defaultDraft);
  }, []);

  return (
    <RentalContext.Provider
      value={{
        draft,
        updatePersonal,
        updateDeposit,
        updateDates,
        setItemQuantity,
        resetDraft,
      }}
    >
      {children}
    </RentalContext.Provider>
  );
}

export function useRentalDraft(): RentalContextValue {
  const ctx = useContext(RentalContext);
  if (!ctx) {
    throw new Error("useRentalDraft must be used within a RentalProvider");
  }
  return ctx;
}

