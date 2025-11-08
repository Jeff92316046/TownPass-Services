const getJoinRecord = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/record`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  } catch (error) {
    console.error('Error fetching join record:', error);
    throw error;
  }
};

export default getJoinRecord;
