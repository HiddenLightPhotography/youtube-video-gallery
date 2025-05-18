const axios = require("axios");

exports.handler = async function () {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = "UCJSmwdPEmRhvaWIpF0azaOQ";

  try {
    // Step 1: Get the uploads playlist ID
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
    const channelRes = await axios.get(channelUrl);
    const uploadsPlaylistId =
      channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

    // Step 2: Fetch all videos from the uploads playlist (with pagination)
    const allItems = [];
    let nextPageToken = "";

    do {
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&pageToken=${nextPageToken}&key=${apiKey}`;
      const playlistRes = await axios.get(playlistUrl);
      allItems.push(...playlistRes.data.items);
      nextPageToken = playlistRes.data.nextPageToken || "";
    } while (nextPageToken);

    // Step 3: Categorize videos
    const categorized = {
      "PixInsight": [],
      "Equipment": [],
      "Software & Capture": [],
      "Processing Techniques": [],
      "Other": []
    };

    allItems.forEach((item) => {
      const title = item.snippet.title.toLowerCase();
      const video = {
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
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
    console.error("Response Data:", error.response?.data);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch video data." }),
    };
  }
};
