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
            name: 'en-AU-Neural2-C', // ← VOICE: Change this to try different voices
                                      //   en-AU-Neural2-A = female voice 1
                                      //   en-AU-Neural2-C = female voice 2 (current)
                                      //   en-AU-Neural2-B = male voice 1
                                      //   en-AU-Neural2-D = male voice 2
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.78, // ← SPEED: 0.7 = very slow, 1.0 = normal, 1.2 = fast
            pitch: -2.5,        // ← PITCH: -6 = very deep, 0 = normal, +6 = very high
            volumeGainDb: 1.0,  // ← VOLUME BOOST: 0 = normal, 1 = slightly louder
            effectsProfileId: ['headphone-class-device'] // ← optimised for earphones
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
