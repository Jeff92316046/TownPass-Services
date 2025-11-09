interface AllRecordRequest {
  place: string | null;
  sport: string | null;
  startTime: string | null;
}

interface RecordResponse {
  records: Array<{
    record_id: string;
    place: {
      place_id: number;
      name: string;
    };
    sport: string;
    start_time: string;
    end_time: string;
    capacity: number;
    status: string;
    organizer_id: string;
  }>;
}

const getAllRecord = async (params: AllRecordRequest): Promise<RecordResponse> => {
  try {
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const response = await fetch(import.meta.env.VITE_BASE_URL + '/record/all', requestOptions);
    if (!response.ok) {
      throw new Error('HTTP error!');
    }
    const data = await response.json();
    const res = {
      ...data,
      organizer_id: ''
    };
    return res.records;
  } catch (error) {
    console.error('Error fetching all records:', error);
    throw error;
  }
};

export default getAllRecord;
