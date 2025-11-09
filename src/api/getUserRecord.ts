interface UserRecordRequest {
  user_id: string;
}

interface UserRecordResponse {
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
  }>[];
}

const getUserRecord = async (params: UserRecordRequest): Promise<UserRecordResponse> => {
  try {
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + params.user_id
      }
    };
    const response = await fetch(
      import.meta.env.VITE_BASE_URL + `/record/get/` + params.user_id,
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
