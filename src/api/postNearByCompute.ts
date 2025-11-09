interface PostNearByComputeRequest {
  latitude: number;
  longitude: number;
}
interface PostNearByComputeResponse {
  places: Array<{
    placeId: string;
    name: string;
  }>;
}
const postNearByCompute = async (
  params: PostNearByComputeRequest
): Promise<PostNearByComputeResponse> => {
  try {
    const response = await fetch(import.meta.env.VITE_BASE_URL + '/compute/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + params.latitude + ',' + params.longitude
      },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export default postNearByCompute;
