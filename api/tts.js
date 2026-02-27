export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not found' });
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
          name: 'en-AU-Neural2-C', // ← VOICE: female Australian
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.78, // ← SPEED: slower feels more calming
          pitch: -2.5,        // ← PITCH: softer and more soothing
          volumeGainDb: 1.0,  // ← VOLUME: slight boost
          effectsProfileId: ['headphone-class-device'] // ← optimised for earphones
        }
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    return res.status(response.status).json({ error: err });
  }

  const data = await response.json();
  return res.status(200).json({ audio: data.audioContent });
}
