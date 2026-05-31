/**
 * Geolocation and Tracking Utilities for Hyperlocal Delivery in Jangaon, Telangana, India
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Returns Jangaon-specific realistic coordinates for any address/landmark to simulate a real-life Swiggy-like delivery board.
 */
export function geocodeAddress(address: string, landmark?: string): Coordinates {
  // Jangaon Town Center Coordinates
  const JangaonBaseLat = 17.7214;
  const JangaonBaseLng = 79.1610;

  const combined = `${address} ${landmark || ''}`.toLowerCase();

  // Preset actual landmarks in Jangaon for precise mapping
  if (combined.includes('station') || combined.includes('rail') || combined.includes('railway')) {
    return { lat: 17.7229, lng: 79.1623 };
  }
  if (combined.includes('bus') || combined.includes('stand') || combined.includes('depot')) {
    return { lat: 17.7188, lng: 79.1575 };
  }
  if (combined.includes('nehru') || combined.includes('park')) {
    return { lat: 17.7196, lng: 79.1593 };
  }
  if (combined.includes('court') || combined.includes('collector') || combined.includes('mro') || combined.includes('govt')) {
    return { lat: 17.7262, lng: 79.1518 };
  }
  if (combined.includes('chowrasta') || combined.includes('cross') || combined.includes('siddharth') || combined.includes('siddartha')) {
    return { lat: 17.7148, lng: 79.1643 };
  }
  if (combined.includes('hospital') || combined.includes('clinic') || combined.includes('dr')) {
    return { lat: 17.7220, lng: 79.1548 };
  }
  if (combined.includes('college') || combined.includes('univ') || combined.includes('school') || combined.includes('vidya')) {
    return { lat: 17.7278, lng: 79.1678 };
  }
  if (combined.includes('temple') || combined.includes('shiva') || combined.includes('hanuman')) {
    return { lat: 17.7245, lng: 79.1601 };
  }

  // Deterministic hashing fallback for any other custom customer address
  // This guarantees each unique address gets a distinct, stable coordinate set in Jangaon
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Bound the offset to +/- 0.012 degrees (approximately 1.3 km max from center)
  const latOffset = (Math.abs(hash % 120) / 10000);
  const lngOffset = (Math.abs((hash >> 3) % 120) / 10000);

  const customLat = JangaonBaseLat + (hash % 2 === 0 ? latOffset : -latOffset);
  const customLng = JangaonBaseLng + (((hash >> 1) % 2 === 0) ? lngOffset : -lngOffset);

  return {
    lat: Number(customLat.toFixed(6)),
    lng: Number(customLng.toFixed(6))
  };
}

/**
 * Calculates the Haversine distance in kilometers between two GPS coordinate sets.
 */
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // in km
  
  return Number(distance.toFixed(2));
}
