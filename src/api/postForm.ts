const postForm = async (data: any) => {
  const response = await fetch(`${import.meta.env.VITE_BASE_URL}/your-endpoint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

export default postForm;
