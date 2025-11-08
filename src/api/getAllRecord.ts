interface AllRecordRequest {
  place: string | null;
  sport: string | null;
  startTime: string | null;
}

interface RecordResponse {
  records: Array<{
    id: string;
    place: {
      placeId: number;
      name: string;
    };
    sport: string;
    startTime: string;
    endTime: string;
    capacity: number;
    status: string;
    organizerId: string;
  }>;
}

const getAllRecord = async (params: AllRecordRequest): Promise<RecordResponse> => {
  try {
    const query = new URLSearchParams();
    if (params.place) query.append('place', params.place);
    if (params.sport) query.append('sport', params.sport);
    if (params.startTime) query.append('startTime', params.startTime);
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const response = await fetch(
      import.meta.env.VITE_API_BASE_URL + `/records?${query.toString()}`,
      requestOptions
    );
    if (!response.ok) {
      throw new Error('HTTP error!');
    }
    const data = await response.json();
    const res = {
      ...data,
      organizerId: ''
    };
    return res;
  } catch (error) {
    console.error('Error fetching all records:', error);
    throw error;
  }
};

export default getAllRecord;
