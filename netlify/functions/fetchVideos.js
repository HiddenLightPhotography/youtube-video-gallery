const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCqHDp9HCrI1PSZYbAIVk4-A';
const MAX_RESULTS = 50;

exports.handler = async function (event, context) {
  console.log("🔁 Netlify function running...");

  try {
    const uploadsRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
    );

    const uploadsPlaylistId = uploadsRes.data.items[0].contentDetails.relatedPlaylists.uploads;

    const videoRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${MAX_RESULTS}&key=${API_KEY}`
    );

    const videos = videoRes.data.items.map(item => {
      const { title, description, thumbnails, resourceId } = item.snippet;
      return {
        title,
        description,
        thumbnail: thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${resourceId.videoId}`,
        category: categorize(title, description)
      };
    });

    const categorized = {};
    videos.forEach(video => {
      const cat = video.category || 'Other';
      if (!categorized[cat]) categorized[cat] = [];
      categorized[cat].push(video);
    });

    const outputPath = path.join(__dirname, '../../public/videos.json');
    fs.writeFileSync(outputPath, JSON.stringify(categorized, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Video list updated!' })
    };
  } catch (err) {
    console.error("❌ Error fetching videos:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch video data.' })
    };
  }
};

function categorize(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('nina')) return 'NINA';
  if (text.includes('pixinsight') || text.includes('starx') || text.includes('ez')) return 'PixInsight';
  if (text.includes('workflow') || text.includes('processing')) return 'Imaging';
  if (text.includes('camera') || text.includes('mount') || text.includes('adapter') || text.includes('filter')) return 'Equipment';
  if (text.includes('software') || text.includes('setup') || text.includes('tools')) return 'Software';
  return 'Other';
}
