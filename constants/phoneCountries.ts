export type PhoneCountry = {
  id?: number;
  name: string;
  code: string;
  dialCode: string;
  phoneLength: number;
  flag: string;
};

let phoneCountriesCache: PhoneCountry[] = [];

export const setPhoneCountries = (countries: PhoneCountry[]) => {
  phoneCountriesCache = countries;
};

export const getPhoneCountries = () => phoneCountriesCache;

export const getPhoneCountryByValue = (
  value?: string | null,
  countries: PhoneCountry[] = phoneCountriesCache,
) => {
  if (!value) return undefined;

  return countries.find((country) => value.startsWith(country.dialCode));
};

export const getPhoneLocalDigits = (value: string, country: PhoneCountry) =>
  value.slice(country.dialCode.length).replace(/\D/g, "");

export const validatePhoneForCountry = (value?: string | null) => {
  if (!value) return false;

  const country = getPhoneCountryByValue(value);

  if (!country) return false;

  return getPhoneLocalDigits(value, country).length === country.phoneLength;
};
