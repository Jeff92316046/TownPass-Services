interface JoinRecordRequest {
  userId: string;
  recordId: string;
}

interface JoinRecordResponse {
  message?: string;
  details?: any;
}

const postJoinRecord = async (params: JoinRecordRequest): Promise<JoinRecordResponse> => {
  try {
    const response = await fetch(
      import.meta.env.VITE_BASE_URL + '/record/join/' + params.recordId,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: params.userId
        },
        body: JSON.stringify(params)
      }
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error posting join record:', error);
    throw error;
  }
};

export default postJoinRecord;
