interface DeleteJoinRecordRequest {
  recordId: string;
  userId: string;
}

interface DeleteJoinRecordResponse {
  details?: any;
}

const deleteJoinRecord = async (
  request: DeleteJoinRecordRequest
): Promise<DeleteJoinRecordResponse> => {
  try {
    const response = await fetch(
      import.meta.env.VITE_BASE_URL + '/record/leave/' + request.recordId,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + request.userId
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete join record');
    }

    return {};
  } catch (error) {
    console.error('Error deleting join record:', error);
    return {
      details: error
    };
  }
};

export default deleteJoinRecord;
