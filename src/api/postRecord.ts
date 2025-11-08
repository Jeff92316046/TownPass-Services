interface postRecordRequest {
  userId: string;
  placeId: number;
  sport: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

interface postRecordResponse {
  recordId: string;
  details?: any;
}

const postRecord = async (data: postRecordRequest): Promise<postRecordResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
