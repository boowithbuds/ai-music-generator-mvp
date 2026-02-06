import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// POST /generate
app.post('/generate', async (req, res) => {
    const { description, mood, duration } = req.body;

    if (!description || !mood || !duration) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // TEMPORARY mock response
    res.json({
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    });
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
