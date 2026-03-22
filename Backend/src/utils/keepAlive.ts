export const startKeepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (!url) return;

  // Ping the server every 14 minutes to prevent Render from sleeping
  setInterval(async () => {
    try {
      const res = await fetch(`${url}/health`);
      if (res.ok) {
        console.log(`Keep-alive ping to ${url} successful`);
      }
    } catch (err) {
      console.error("Keep-alive ping failed:", err);
    }
  }, 14 * 60 * 1000); 
};
