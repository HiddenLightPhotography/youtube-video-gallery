const axios = require("axios");

exports.handler = async function () {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = "UCJSmwdPEmRhvaWIpF0azaOQ";
  const maxResults = 160;

  const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}`;

  try {
    const response = await axios.get(apiUrl);
    const items = response.data.items;

    const categorized = {
      "PixInsight": [],
      "Equipment": [],
      "Software & Capture": [],
      "Processing Techniques": [],
      "Other": []
    };

    items
      .filter((item) => item.id.kind === "youtube#video")
      .forEach((item) => {
        const title = item.snippet.title.toLowerCase();
        const video = {
          title: item.snippet.title,
          videoId: item.id.videoId,
          thumbnail: item.snippet.thumbnails.medium.url,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        };

        if (title.includes("pixinsight")) categorized["PixInsight"].push(video);
        else if (title.includes("mount") || title.includes("telescope")) categorized["Equipment"].push(video);
        else if (title.includes("capture") || title.includes("nina") || title.includes("studio")) categorized["Software & Capture"].push(video);
        else if (title.includes("stretch") || title.includes("curves") || title.includes("color")) categorized["Processing Techniques"].push(video);
        else categorized["Other"].push(video);
      });

    return {
      statusCode: 200,
      body: JSON.stringify(categorized),
    };
  } catch (error) {
    console.error("❌ YouTube API Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch video data." }),
    };
  }
};
