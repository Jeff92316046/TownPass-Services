const getSportList = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/list/sports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  } catch (error) {
    console.error('Error fetching sport list:', error);
    throw error;
  }
};

export default getSportList;
