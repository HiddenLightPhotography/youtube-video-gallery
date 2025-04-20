const axios = require("axios");

exports.handler = async function (event, context) {
  const apiKey = process.env.YOUTUBE_API_KEY; // Use your environment variable
  const channelId = "UCJSmwdPEmRhvaWIpF0azaOQ";  // Correct channel ID
  const maxResults = 160;  // Maximum per request
  let allVideos = [];
  let nextPageToken = null;

  // Fetch videos with pagination
  try {
    do {
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}&pageToken=${nextPageToken || ''}`;
      
      const response = await axios.get(apiUrl);
      
      // Filter out non-video results
      const videos = response.data.items
        .filter(item => item.id.kind === "youtube#video")
        .map(item => ({
          title: item.snippet.title,
          videoId: item.id.videoId,
          thumbnail: item.snippet.thumbnails.medium.url,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));

      allVideos = [...allVideos, ...videos];  // Append the new videos
      nextPageToken = response.data.nextPageToken;  // Get the next page token for the next request

    } while (nextPageToken);  // Continue if there are more pages

    console.log("🟢 All videos fetched:", allVideos.length);

    return {
      statusCode: 200,
      body: JSON.stringify(allVideos),
    };
  } catch (error) {
    console.error("❌ YouTube API Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch video data." }),
    };
  }
};

