import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ICountry } from "@/interfaces/type";


const getCountries = async (): Promise<ICountry[]> => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/region/africa?fields=name,flags,idd,translations,latlng');
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

export const useCountries = (searchText: string) => {
  const { data, isLoading, error } = useQuery<ICountry[], Error>({
    queryKey: ['countries'],
    queryFn: getCountries,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const filteredCountries = data?.filter(country => 
    country.translations.fra.official.toLowerCase().includes(searchText.toLowerCase())
  );

  return { countries: filteredCountries, isLoading, error }
}