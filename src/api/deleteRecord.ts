interface DeleteRecordRequest {
  recordId: string;
}

interface DeleteRecordResponse {
  details?: any;
}

const deleteRecord = async (params: DeleteRecordRequest): Promise<DeleteRecordResponse> => {
  try {
    const response = await fetch(
      import.meta.env.VITE_API_BASE_URL + '/record/delete/' + params.recordId,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + params.recordId
        }
      }
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
};

export default deleteRecord;
