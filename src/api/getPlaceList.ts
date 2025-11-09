interface PlaceListRequest {
  sport: string | null;
}

interface PlaceListResponse {
  places: Array<{
    place_id: string;
    name: string;
  }>;
  details?: any;
}

const getPlaceList = async (params: PlaceListRequest): Promise<PlaceListResponse> => {
  console.log('Fetching Place List with params:', params);
  const response = await fetch(
    import.meta.env.VITE_BASE_URL + '/list/places?sport=' + params.sport,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch place list');
  }

  console.log('Fetch Place List Response Data:', await response.clone().json());

  return response.json();
};

export default getPlaceList;
