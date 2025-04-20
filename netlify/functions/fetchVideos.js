const axios = require("axios");

exports.handler = async function (event, context) {
  const apiKey = "AIzaSyAWWWWBmf-DYEkq9RgAkTfLSitv8i2iBWA";
  const channelId = "UCDH-CyR4FjZ95h3kL91Krkw"; // Replace with your channel ID
  const maxResults = 10;

  const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}`;

  try {
    const response = await axios.get(apiUrl);
    const videos = response.data.items.map((item) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));

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
