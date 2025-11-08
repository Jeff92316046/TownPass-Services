interface PlaceListRequest {
  sport: string | null;
}

interface PlaceListResponse {
  places: Array<{
    placeId: number;
    name: string;
  }>;
  details?: any;
}

const getPlaceList = async (params: PlaceListRequest): Promise<PlaceListResponse> => {
  const response = await fetch(import.meta.env.VITE_BASE_URL + '/list/places', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error('Failed to fetch place list');
  }

  return response.json();
};

export default getPlaceList;
