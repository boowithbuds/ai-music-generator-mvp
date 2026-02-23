// Esperamos a que el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {

  // Referencias a elementos del HTML
  const generateBtn = document.getElementById("generate-btn"); // botón generar
  const descriptionInput = document.getElementById("description"); // textarea descripción
  const moodSelect = document.getElementById("mood"); // select mood
  const durationSelect = document.getElementById("duration"); // select duración
  const resultContainer = document.getElementById("result-container"); // contenedor resultado
  const downloadBtn = document.getElementById("download-btn"); // botón descargar

  // Evento al hacer click en generar
  generateBtn.addEventListener("click", async () => {

    // Cambiamos texto del botón para indicar que está trabajando
    generateBtn.textContent = "Generando...";
    generateBtn.disabled = true; // desactiva botón mientras procesa

    try {

      // Construimos objeto que enviaremos al backend
      const requestData = {
        description: descriptionInput.value, // texto del usuario
        mood: moodSelect.value, // mood seleccionado
        duration: durationSelect.value // duración seleccionada
      };

      // Hacemos la petición POST al backend
      const response = await fetch("http://localhost:3001/generate", {
        method: "POST", // tipo POST
        headers: {
          "Content-Type": "application/json" // enviamos JSON
        },
        body: JSON.stringify(requestData) // convertimos objeto a JSON string
      });

      // Si el backend devuelve error HTTP
      if (!response.ok) {
        throw new Error("Error generating MIDI");
      }

      // Recibimos el archivo como blob (binario)
      const blob = await response.blob();

      // Creamos URL temporal para el archivo
      const url = window.URL.createObjectURL(blob);

      // Creamos elemento <a> invisible
      const a = document.createElement("a");
      a.href = url; // le asignamos la URL del blob
      a.download = "generated_music.mid"; // nombre del archivo al descargar
      document.body.appendChild(a);
      a.click(); // simulamos click para descargar
      a.remove(); // eliminamos el elemento

      // Mostramos sección resultado (aunque no haya audio)
      resultContainer.style.display = "block";

    } catch (error) {

      console.error(error); // mostramos error en consola
      alert("Error generating music"); // mostramos mensaje al usuario

    } finally {

      // Restauramos botón
      generateBtn.textContent = "Generar música";
      generateBtn.disabled = false;

    }

  });

});