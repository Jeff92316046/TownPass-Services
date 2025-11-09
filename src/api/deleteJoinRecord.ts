interface DeleteJoinRecordRequest {
  record_id: string;
  user_id: string;
}

interface DeleteJoinRecordResponse {
  details?: any;
}

const deleteJoinRecord = async (
  params: DeleteJoinRecordRequest
): Promise<DeleteJoinRecordResponse> => {
  try {
    console.log('Deleting Join Record with params:', params);
    const response = await fetch(
      import.meta.env.VITE_BASE_URL +
        '/record/leave/' +
        params.record_id +
        '?user_id=' +
        params.user_id,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + params.user_id
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
