# Architecture (MVP)

## Components
- Frontend: simple web form + audio player
- Backend: API to orchestrate generation
- LLM: turns user text into safe music parameters (no artists)
- Music engine: generates the audio
- Storage: stores audio files and track metadata

## API
- POST /generate -> returns track_id + audio_url
- GET /track/:id -> returns track metadata + audio_url

## Flow
1. User submits prompt + duration + mood
2. Backend validates limits (rate limit, max duration)
3. Backend calls LLM to normalize parameters + safety filter
4. Backend calls music engine to generate audio
5. Backend uploads audio to storage
6. Backend saves track record (params + url)
7. Frontend plays audio + allows download
