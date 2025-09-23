export interface OrderItem {
  id: string;
  clientName: string;
  note: string;
  products: {
    aroma250: number;
    oscar250: number;
    aromaEspresso250: number;
    aromaFamiliale: number;
    aroma125: number;
    oscar125: number;
    aroma5kg: number;
    oscar5kg: number;
    aromaPot700: number;
    oscarPot400: number;
    capsules: number;
    cafeDor400: number;
    aromaGold250: number;
    payment: string;
  };
}

export interface OrderFormData {
  clientName: string;
  note: string;
  products: OrderItem['products'];
}

export const COFFEE_PRODUCTS = [
  { key: 'aroma250' as const, name: 'AROMA 250g', shortName: 'A250' },
  { key: 'oscar250' as const, name: 'OSCAR 250g', shortName: 'O250' },
  { key: 'aromaEspresso250' as const, name: 'AROMA Espresso 250g', shortName: 'AE250' },
  { key: 'aromaFamiliale' as const, name: 'AROMA Familiale', shortName: 'AF' },
  { key: 'aroma125' as const, name: 'AROMA 125g', shortName: 'A125' },
  { key: 'oscar125' as const, name: 'Oscar 125g', shortName: 'O125' },
  { key: 'aroma5kg' as const, name: 'AROMA 5KG', shortName: '5KG' },
  { key: 'oscar5kg' as const, name: 'Oscar 5KG', shortName: 'O5KG' },
  { key: 'aromaPot700' as const, name: 'AROMA Pot 700g', shortName: 'AP700' },
  { key: 'oscarPot400' as const, name: 'Oscar Pot 400g', shortName: 'OP400' },
  { key: 'capsules' as const, name: 'Capsules', shortName: 'CAP' },
  { key: 'cafeDor400' as const, name: 'Café D\'Or 400g', shortName: 'CD400' },
  { key: 'aromaGold250' as const, name: 'Aroma GOLD 250g', shortName: 'AG250' },
  { key: 'payment' as const, name: 'Payment', shortName: 'PAY' }
] as const;