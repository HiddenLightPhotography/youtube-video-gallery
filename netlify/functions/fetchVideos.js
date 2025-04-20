const axios = require("axios");

exports.handler = async function (event, context) {
  const apiKey = process.env.YOUTUBE_API_KEY; // ← this reads your environment variable set in Netlify
  const channelId = "UCJSmwdPEmRhvaWIpF0azaOQ";
  const maxResults = 10;

  const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}`;

  try {
    const response = await axios.get(apiUrl);

    console.log("🟡 Full API response:");
    console.log(JSON.stringify(response.data, null, 2)); // << This shows exactly what's coming back

    const videos = response.data.items
      .filter((item) => item.id.kind === "youtube#video")
      .map((item) => ({
        title: item.snippet.title,
        videoId: item.id.videoId,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));

    console.log("🟢 Filtered video list:");
    console.log(videos);

    return {
      statusCode: 200,
      body: JSON.stringify(videos),
    };
  } catch (error) {
    console.error("❌ YouTube API Error:");
    console.error("Message:", error.message);
    console.error("Response Data:", error.response?.data);
    console.error("Response Status:", error.response?.status);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch video data." }),
    };
  }
};
