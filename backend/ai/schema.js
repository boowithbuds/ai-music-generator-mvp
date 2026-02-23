export const musicBlueprintSchema = `
{
  "meta": {
    "genre": "",
    "mood": "",
    "bpm": 0,
    "key": "",
    "time_signature": "4/4"
  },
  "structure": [
    { "section": "intro", "bars": 4 },
    { "section": "hook", "bars": 8 },
    { "section": "verse", "bars": 16 }
  ],
  "tracks": [
    { "type": "chords", "pattern": ["", "", "", ""] },
    { "type": "bass", "pattern": ["", "", "", ""] },
    { "type": "drums", "instrument": "kick", "pattern": "" },
    { "type": "drums", "instrument": "snare", "pattern": "" },
    { "type": "drums", "instrument": "hihat", "pattern": "" }
  ]
}
`;
