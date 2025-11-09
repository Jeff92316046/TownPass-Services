interface JoinRecordRequest {
  user_id: string;
  record_id: string;
}

interface JoinRecordResponse {
  message?: string;
  details?: any;
}

const postJoinRecord = async (params: JoinRecordRequest): Promise<JoinRecordResponse> => {
  try {
    const response = await fetch(
      import.meta.env.VITE_BASE_URL + '/record/join/' + params.record_id,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + params.user_id
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
