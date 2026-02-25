exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text } = JSON.parse(event.body);

    if (!text) {
      return { statusCode: 400, body: 'No text provided' };
    }

    const apiKey = process.env.GOOGLE_TTS_API_KEY;

    if (!apiKey) {
      return { statusCode: 500, body: 'API key not found' };
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-AU',
            name: 'en-AU-Neural2-A',
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.9,
            pitch: 0
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return { statusCode: response.status, body: err };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio: data.audioContent })
    };

  } catch (err) {
    return { statusCode: 500, body: 'Server error: ' + err.message };
  }
};
