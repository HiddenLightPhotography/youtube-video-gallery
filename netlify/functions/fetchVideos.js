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

    const keywordMap = {
      "PixInsight": ["pixinsight", "spcc", "dbe", "process", "histogram", "pixelmath", "ez"],
      "Equipment": ["mount", "telescope", "eq6", "skywatcher", "asi", "camera", "tripod", "guide scope", "zwo", "focuser"],
      "Software & Capture": ["capture", "nina", "studio", "sequencing", "autofocus", "dithering", "plate solve", "control"],
      "Processing Techniques": ["stretch", "curves", "color", "deconvolution", "sharpen", "noise", "gradient", "background", "stars"]
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

        let matched = false;
        for (const category in keywordMap) {
          if (keywordMap[category].some(keyword => title.includes(keyword))) {
            categorized[category].push(video);
            matched = true;
            break;
          }
        }

        if (!matched) categorized["Other"].push(video);
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
