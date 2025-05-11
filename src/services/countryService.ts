export const countryCodes: { [key: string]: string } = {
  'spain': 'es',
  'france': 'fr',
  'italy': 'it',
  'germany': 'de',
  'united kingdom': 'uk',
  'portugal': 'pt',
  'netherlands': 'nl',
  'belgium': 'be',
  'switzerland': 'ch',
  'austria': 'at',
  'ireland': 'ie',
  'sweden': 'se',
  'norway': 'no',
  'denmark': 'dk',
  'finland': 'fi',
  'greece': 'gr',
  'poland': 'pl',
  'czech republic': 'cz',
  'hungary': 'hu',
  'romania': 'ro',
  'bulgaria': 'bg',
  'croatia': 'hr',
  'slovenia': 'si',
  'slovakia': 'sk',
  'lithuania': 'lt',
  'latvia': 'lv',
  'estonia': 'ee',
  'cyprus': 'cy',
  'malta': 'mt',
  'luxembourg': 'lu',
  'iceland': 'is'
};

export const getCountryCode = (countryName: string): string => {
  const normalizedCountry = countryName.toLowerCase().trim();
  return countryCodes[normalizedCountry] || 'es'; 
};

export const getCountryName = (countryCode: string): string => {
  const entry = Object.entries(countryCodes).find(([_, code]) => code === countryCode.toLowerCase());
  return entry ? entry[0] : 'Spain'; 
};

export const isValidCountry = (countryName: string): boolean => {
  const normalizedCountry = countryName.toLowerCase().trim();
  return countryCodes.hasOwnProperty(normalizedCountry);
};

export const getSupportedCountries = (): string[] => {
  return Object.keys(countryCodes).map(country => 
    country.charAt(0).toUpperCase() + country.slice(1)
  );
}; 