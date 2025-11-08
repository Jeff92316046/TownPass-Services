interface UserRecordRequest {
  userId: string;
}

interface UserRecordResponse {
  records: Array<{
    recordId: string;
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
  }>[];
}

const getUserRecord = async (params: UserRecordRequest): Promise<UserRecordResponse> => {
  try {
    const query = new URLSearchParams();
    if (params.userId) query.append('userId', params.userId);
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: params.userId
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

export default getUserRecord;
