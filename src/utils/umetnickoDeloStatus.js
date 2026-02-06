export const STATUS = {
  Dostupno: 0,
  Prodato: 1,
  Uklonjeno: 2,
};

export const isRemoved = (status) => Number(status) === STATUS.Uklonjeno;
