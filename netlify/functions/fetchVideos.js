const axios = require("axios");

exports.handler = async function (event, context) {
  const apiKey = process.env.YOUTUBE_API_KEY; // ✅ Use env var
  const channelId = "UCDH-CyR4FjZ95h3kL91Krkw";
  const maxResults = 10;

  const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}`;

  try {
    const response = await axios.get(apiUrl);
    const items = response.data.items || [];

    // 🔍 Filter out results without a videoId (e.g., channels or playlists)
    const videos = items
      .filter(item => item.id.kind === "youtube#video")
      .map((item) => ({
        title: item.snippet.title,
        videoId: item.id.videoId,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));

    return {
      statusCode: 200,
      body: JSON.stringify(videos),
    };
  } catch (error) {
    console.error("❌ YouTube API Error:", error.message);
    console.error("🔎 Full error:", error.response?.data || error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch video data." }),
    };
  }
};
