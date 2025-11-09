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
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + params.userId
      }
    };
    const response = await fetch(
      import.meta.env.VITE_BASE_URL + `/record/get/` + params.userId,
      requestOptions
    );
    console.log('Response received:', response);
    if (!response.ok) {
      throw new Error('HTTP error!');
    }
    const data = await response.json();
    console.log('Fetched user records:', data);
    const res = {
      ...data,
      organizerId: ''
    };
    console.log('Processed user records:', res);
    return res;
  } catch (error) {
    console.error('Error fetching all records:', error);
    throw error;
  }
};

export default getUserRecord;
