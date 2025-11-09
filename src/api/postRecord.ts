interface postRecordRequest {
  user_id: string;
  place_id: string;
  sport: string;
  start_time: string;
  end_time: string;
  capacity: number;
}

interface postRecordResponse {
  record_id: string;
  details?: any;
}

const postRecord = async (data: postRecordRequest): Promise<postRecordResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/record/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.user_id}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  } catch (error) {
    console.error('Error fetching join record:', error);
    throw error;
  }
};

export default postRecord;
