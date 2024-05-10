export const loader = async () => {
  return new Response("OK", {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
