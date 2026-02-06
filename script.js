// DOM elements
const generateBtn = document.getElementById('generate-btn');
const resultContainer = document.getElementById('result-container');
const audioPlayer = document.getElementById('audio-player');
const downloadBtn = document.getElementById('download-btn');
const descriptionTextarea = document.getElementById('description');
const moodSelect = document.getElementById('mood');
const durationSelect = document.getElementById('duration');

// Handle "Generate music" button
generateBtn.addEventListener('click', async () => {
    const description = descriptionTextarea.value.trim();

    if (!description) {
        alert('Por favor, describe la música que quieres generar');
        descriptionTextarea.focus();
        return;
    }

    const mood = moodSelect.value;
    const duration = durationSelect.value;

    // UI: loading state
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
    resultContainer.style.display = 'none';

    // TEMPORARY: mock generation
    // This will be replaced by a real AI generation
    await generateFromBackend(description, mood, duration);

    // UI: show result
    generateBtn.classList.remove('loading');
    generateBtn.disabled = false;
    resultContainer.style.display = 'block';

    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});


/**
 * TEMPORARY FUNCTION
 * ----------------------
 * Simulates music generation.
 * This function that calls backend Soundhelix funct.
 */

async function generateFromBackend(description, mood, duration) {
    const response = await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, mood, duration })
    });

    if (!response.ok) {
        alert('Error generating music');
        return;
    }

    const data = await response.json();
    audioPlayer.src = data.audioUrl;
}


// Download generated audio
downloadBtn.addEventListener('click', () => {
    const audioSrc = audioPlayer.src;

    if (!audioSrc) {
        alert('No hay música generada para descargar');
        return;
    }

    const a = document.createElement('a');
    a.href = audioSrc;
    a.download = `ai-music-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Auto-resize textarea
descriptionTextarea.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

// Focus textarea on load
descriptionTextarea.focus();
