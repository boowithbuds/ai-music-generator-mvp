// ----------------------------
// Imports (librerías)
// ----------------------------

import express from "express"; // servidor web (API)
import cors from "cors"; // permite llamadas desde el frontend (CORS)
import dotenv from "dotenv"; // carga variables de entorno desde .env
import OpenAI from "openai"; // cliente oficial OpenAI
import { buildMusicPrompt } from "./ai/prompt.js"; // tu prompt builder (devuelve messages[])
import MidiPackage from "@tonejs/midi"; // librería MIDI (CommonJS importado como paquete)
import fs from "fs"; // escribir/borrar archivos en disco
import path from "path"; // construir rutas seguras

const { Midi } = MidiPackage; // extraemos la clase Midi del paquete

// ----------------------------
// Config
// ----------------------------

dotenv.config(); // lee .env y mete las variables en process.env

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // tu API key desde .env
});

const app = express(); // crea app Express
const PORT = 3001; // puerto backend

// ----------------------------
// Middlewares
// ----------------------------

app.use(cors()); // permite peticiones del frontend
app.use(express.json()); // permite leer JSON en req.body

// ----------------------------
// Helpers MIDI
// ----------------------------

// Convierte acordes MUY básicos a triadas (MVP).
// Si GPT devuelve acordes fuera de este mapa, caemos en C mayor como fallback.
function chordToNotes(chord) {
  // Normalizamos espacios (por si GPT devuelve "Am " o " Am")
  const c = (chord || "").trim();

  // Mapa mínimo de acordes para MVP (lo ampliaremos luego)
  const chordMap = {
    C: ["C4", "E4", "G4"],
    Dm: ["D4", "F4", "A4"],
    Em: ["E4", "G4", "B4"],
    F: ["F4", "A4", "C5"],
    G: ["G4", "B4", "D5"],
    Am: ["A4", "C5", "E5"],
  };

  return chordMap[c] || ["C4", "E4", "G4"]; // fallback
}

// ----------------------------
// POST /generate
// ----------------------------

app.post("/generate", async (req, res) => {
  try {
    // Leemos inputs del frontend
    const { description, genre, mood, bpm } = req.body;

    // Llamamos a OpenAI usando tu prompt builder (messages array)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // barato y suficiente para blueprint
      temperature: 0.7, // algo de creatividad controlada
      messages: buildMusicPrompt({ description, genre, mood, bpm }), // OJO: debe devolver array de {role, content}
    });

    // Cogemos el texto que devolvió GPT
    const content = completion.choices?.[0]?.message?.content || "";

    // Parseamos JSON (si GPT no devuelve JSON válido, esto lanzará error y caerá al catch)
    const musicBlueprint = JSON.parse(content);

    // Logs útiles para debug
    console.log("BPM:", musicBlueprint?.meta?.bpm);
    console.log(
      "CHORDS TRACK:",
      musicBlueprint?.tracks?.find((t) => t.type === "chords")
    );

    // ----------------------------
    // MIDI: SOLO ACORDES (A)
    // ----------------------------

    // Creamos archivo MIDI en memoria
    const midi = new Midi(); // contenedor MIDI
    const track = midi.addTrack(); // pista donde meteremos los acordes

    // BPM: usamos el del blueprint; si falta, usamos el del input; si falta, 120
    const finalBpm = parseInt(musicBlueprint?.meta?.bpm) || parseInt(bpm) || 120;
    midi.header.setTempo(finalBpm); // aplica tempo al MIDI

    // Sacamos la progresión de acordes desde tracks[]
    const chordTrack = musicBlueprint?.tracks?.find((t) => t.type === "chords");

    // Si no existe o viene vacío, ponemos un fallback (para que SIEMPRE descargues algo)
    const chordProgression =
      chordTrack?.pattern?.filter((x) => String(x || "").trim() !== "") || [];

    const safeProgression =
      chordProgression.length > 0 ? chordProgression : ["C", "Am", "F", "G"]; // fallback final

    // Cada acorde dura 1 compás (1 bar) por simplicidad
    // time se mide en "beats" internos de ToneJS MIDI; para MVP 1 = 1 compás a ojo.
    safeProgression.forEach((chord, index) => {
      const notes = chordToNotes(chord); // acorde -> triada

      notes.forEach((note) => {
        track.addNote({
          name: note, // nota tipo "C4"
          time: index * 1, // acorde 0 en compás 0, acorde 1 en compás 1, etc.
          duration: 1, // duración 1 compás
          velocity: 0.8, // fuerza de la nota (0..1)
        });
      });
    });

    // ----------------------------
    // Guardar y enviar archivo
    // ----------------------------

    // Guardamos el .mid en una ruta temporal dentro del backend
    const fileName = "generated_music.mid"; // nombre que verá el usuario al descargar
    const filePath = path.join(process.cwd(), fileName); // ruta absoluta segura

    // Convertimos el MIDI a bytes y lo escribimos en disco
    fs.writeFileSync(filePath, Buffer.from(midi.toArray())); // crea el archivo .mid

    // Enviamos el archivo como descarga al frontend
    res.download(filePath, fileName, (err) => {
      // Este callback se ejecuta cuando termina el envío (o falla)
      try {
        fs.unlinkSync(filePath); // borramos el archivo temporal (limpieza)
      } catch (e) {
        // si falla el borrado, no rompemos la app
      }

      if (err) {
        console.error("Download error:", err);
      }
    });
  } catch (error) {
    // Si falla GPT, JSON.parse, o MIDI, respondemos con error JSON (para que el frontend muestre mensaje)
    console.error("Generate error:", error);

    res.status(500).json({
      error: "Generation failed",
      details: error?.message || String(error),
    });
  }
});

// ----------------------------
// Start server
// ----------------------------

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`); // confirmación en consola
});