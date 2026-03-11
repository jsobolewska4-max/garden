// USDA Hardiness Zone data for major US & Canadian cities
// Each entry: city name -> { zone, lastFrostDate (month-day), firstFrostDate (month-day) }

export interface ZoneData {
  zone: string;
  lastFrost: string; // MM-DD format (average last spring frost)
  firstFrost: string; // MM-DD format (average first fall frost)
  state: string;
}

export const cityZones: Record<string, ZoneData> = {
  // Zone 3
  "Anchorage, AK": { zone: "3b", lastFrost: "05-15", firstFrost: "09-15", state: "AK" },
  "Fairbanks, AK": { zone: "3a", lastFrost: "05-25", firstFrost: "08-31", state: "AK" },
  "Duluth, MN": { zone: "3b", lastFrost: "05-15", firstFrost: "09-25", state: "MN" },
  "Bismarck, ND": { zone: "3b", lastFrost: "05-14", firstFrost: "09-22", state: "ND" },
  "Fargo, ND": { zone: "3b", lastFrost: "05-13", firstFrost: "09-27", state: "ND" },
  "International Falls, MN": { zone: "3a", lastFrost: "05-20", firstFrost: "09-18", state: "MN" },

  // Zone 4
  "Minneapolis, MN": { zone: "4b", lastFrost: "04-30", firstFrost: "10-07", state: "MN" },
  "Madison, WI": { zone: "4b", lastFrost: "05-01", firstFrost: "10-07", state: "WI" },
  "Milwaukee, WI": { zone: "5a", lastFrost: "04-28", firstFrost: "10-10", state: "WI" },
  "Burlington, VT": { zone: "4b", lastFrost: "05-04", firstFrost: "10-01", state: "VT" },
  "Bangor, ME": { zone: "4b", lastFrost: "05-10", firstFrost: "09-28", state: "ME" },
  "Winnipeg, MB": { zone: "4a", lastFrost: "05-21", firstFrost: "09-22", state: "MB" },
  "Calgary, AB": { zone: "4a", lastFrost: "05-23", firstFrost: "09-15", state: "AB" },
  "Edmonton, AB": { zone: "4a", lastFrost: "05-18", firstFrost: "09-15", state: "AB" },
  "Saskatoon, SK": { zone: "4a", lastFrost: "05-21", firstFrost: "09-15", state: "SK" },
  "Regina, SK": { zone: "4a", lastFrost: "05-21", firstFrost: "09-12", state: "SK" },

  // Zone 5
  "Denver, CO": { zone: "5b", lastFrost: "05-03", firstFrost: "10-08", state: "CO" },
  "Des Moines, IA": { zone: "5b", lastFrost: "04-22", firstFrost: "10-12", state: "IA" },
  "Chicago, IL": { zone: "5b", lastFrost: "04-20", firstFrost: "10-15", state: "IL" },
  "Detroit, MI": { zone: "5b", lastFrost: "04-25", firstFrost: "10-12", state: "MI" },
  "Cleveland, OH": { zone: "5b", lastFrost: "04-25", firstFrost: "10-15", state: "OH" },
  "Boston, MA": { zone: "5b", lastFrost: "04-15", firstFrost: "10-20", state: "MA" },
  "Hartford, CT": { zone: "5b", lastFrost: "04-22", firstFrost: "10-10", state: "CT" },
  "Salt Lake City, UT": { zone: "5b", lastFrost: "04-30", firstFrost: "10-10", state: "UT" },
  "Omaha, NE": { zone: "5b", lastFrost: "04-18", firstFrost: "10-10", state: "NE" },
  "Lincoln, NE": { zone: "5b", lastFrost: "04-18", firstFrost: "10-10", state: "NE" },
  "Boise, ID": { zone: "5b", lastFrost: "05-05", firstFrost: "10-05", state: "ID" },
  "Ottawa, ON": { zone: "5a", lastFrost: "05-06", firstFrost: "10-01", state: "ON" },
  "Montreal, QC": { zone: "5a", lastFrost: "05-03", firstFrost: "10-03", state: "QC" },

  // Zone 6
  "Kansas City, MO": { zone: "6a", lastFrost: "04-09", firstFrost: "10-21", state: "MO" },
  "St. Louis, MO": { zone: "6a", lastFrost: "04-07", firstFrost: "10-20", state: "MO" },
  "Indianapolis, IN": { zone: "6a", lastFrost: "04-17", firstFrost: "10-15", state: "IN" },
  "Columbus, OH": { zone: "6a", lastFrost: "04-17", firstFrost: "10-15", state: "OH" },
  "Pittsburgh, PA": { zone: "6a", lastFrost: "04-20", firstFrost: "10-15", state: "PA" },
  "Philadelphia, PA": { zone: "6b", lastFrost: "04-08", firstFrost: "10-25", state: "PA" },
  "New York, NY": { zone: "6b", lastFrost: "04-10", firstFrost: "10-25", state: "NY" },
  "Providence, RI": { zone: "6a", lastFrost: "04-15", firstFrost: "10-15", state: "RI" },
  "Portland, OR": { zone: "6b", lastFrost: "04-10", firstFrost: "10-25", state: "OR" },
  "Seattle, WA": { zone: "6b", lastFrost: "04-06", firstFrost: "11-05", state: "WA" },
  "Spokane, WA": { zone: "6a", lastFrost: "04-25", firstFrost: "10-05", state: "WA" },
  "Albuquerque, NM": { zone: "6b", lastFrost: "04-13", firstFrost: "10-25", state: "NM" },
  "Toronto, ON": { zone: "6a", lastFrost: "04-25", firstFrost: "10-10", state: "ON" },
  "Hamilton, ON": { zone: "6a", lastFrost: "04-25", firstFrost: "10-12", state: "ON" },
  "Halifax, NS": { zone: "6a", lastFrost: "05-01", firstFrost: "10-10", state: "NS" },

  // Zone 7
  "Nashville, TN": { zone: "7a", lastFrost: "04-01", firstFrost: "10-28", state: "TN" },
  "Memphis, TN": { zone: "7b", lastFrost: "03-22", firstFrost: "11-05", state: "TN" },
  "Richmond, VA": { zone: "7a", lastFrost: "04-06", firstFrost: "10-26", state: "VA" },
  "Washington, DC": { zone: "7a", lastFrost: "04-01", firstFrost: "10-28", state: "DC" },
  "Baltimore, MD": { zone: "7a", lastFrost: "04-01", firstFrost: "10-28", state: "MD" },
  "Charlotte, NC": { zone: "7b", lastFrost: "03-28", firstFrost: "11-05", state: "NC" },
  "Raleigh, NC": { zone: "7b", lastFrost: "03-28", firstFrost: "11-05", state: "NC" },
  "Oklahoma City, OK": { zone: "7a", lastFrost: "03-28", firstFrost: "11-05", state: "OK" },
  "Tulsa, OK": { zone: "7a", lastFrost: "03-28", firstFrost: "11-05", state: "OK" },
  "Little Rock, AR": { zone: "7b", lastFrost: "03-19", firstFrost: "11-08", state: "AR" },
  "Vancouver, BC": { zone: "7b", lastFrost: "03-28", firstFrost: "11-02", state: "BC" },
  "Victoria, BC": { zone: "7b", lastFrost: "03-25", firstFrost: "11-05", state: "BC" },

  // Zone 8
  "Atlanta, GA": { zone: "8a", lastFrost: "03-15", firstFrost: "11-15", state: "GA" },
  "Dallas, TX": { zone: "8a", lastFrost: "03-12", firstFrost: "11-17", state: "TX" },
  "Fort Worth, TX": { zone: "8a", lastFrost: "03-12", firstFrost: "11-17", state: "TX" },
  "Austin, TX": { zone: "8b", lastFrost: "03-03", firstFrost: "11-25", state: "TX" },
  "San Antonio, TX": { zone: "8b", lastFrost: "03-01", firstFrost: "11-28", state: "TX" },
  "Portland, ME": { zone: "5b", lastFrost: "05-01", firstFrost: "10-07", state: "ME" },
  "Savannah, GA": { zone: "8b", lastFrost: "03-01", firstFrost: "11-28", state: "GA" },
  "Charleston, SC": { zone: "8b", lastFrost: "03-01", firstFrost: "11-28", state: "SC" },
  "Columbia, SC": { zone: "8a", lastFrost: "03-15", firstFrost: "11-15", state: "SC" },
  "Jacksonville, FL": { zone: "8b", lastFrost: "02-25", firstFrost: "12-01", state: "FL" },
  "Shreveport, LA": { zone: "8a", lastFrost: "03-10", firstFrost: "11-15", state: "LA" },

  // Zone 9
  "Houston, TX": { zone: "9a", lastFrost: "02-15", firstFrost: "12-05", state: "TX" },
  "Phoenix, AZ": { zone: "9b", lastFrost: "02-05", firstFrost: "12-15", state: "AZ" },
  "Tucson, AZ": { zone: "9a", lastFrost: "02-15", firstFrost: "12-10", state: "AZ" },
  "Las Vegas, NV": { zone: "9a", lastFrost: "02-20", firstFrost: "12-01", state: "NV" },
  "Sacramento, CA": { zone: "9a", lastFrost: "02-15", firstFrost: "12-01", state: "CA" },
  "San Francisco, CA": { zone: "9b", lastFrost: "01-15", firstFrost: "12-15", state: "CA" },
  "San Jose, CA": { zone: "9b", lastFrost: "02-01", firstFrost: "12-10", state: "CA" },
  "New Orleans, LA": { zone: "9a", lastFrost: "02-15", firstFrost: "12-05", state: "LA" },
  "Tampa, FL": { zone: "9b", lastFrost: "01-25", firstFrost: "12-20", state: "FL" },
  "Orlando, FL": { zone: "9b", lastFrost: "02-01", firstFrost: "12-15", state: "FL" },
  "San Diego, CA": { zone: "9b", lastFrost: "01-15", firstFrost: "12-20", state: "CA" },
  "Los Angeles, CA": { zone: "9b", lastFrost: "01-15", firstFrost: "12-20", state: "CA" },
  "Fresno, CA": { zone: "9a", lastFrost: "02-15", firstFrost: "12-01", state: "CA" },

  // Zone 10
  "Miami, FL": { zone: "10b", lastFrost: "01-01", firstFrost: "12-31", state: "FL" },
  "Fort Lauderdale, FL": { zone: "10b", lastFrost: "01-01", firstFrost: "12-31", state: "FL" },
  "Naples, FL": { zone: "10a", lastFrost: "01-10", firstFrost: "12-25", state: "FL" },
  "Honolulu, HI": { zone: "10b", lastFrost: "01-01", firstFrost: "12-31", state: "HI" },
};

export function searchCities(query: string): string[] {
  const lower = query.toLowerCase();
  return Object.keys(cityZones).filter((city) =>
    city.toLowerCase().includes(lower)
  );
}
