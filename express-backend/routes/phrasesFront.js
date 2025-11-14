const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Ruta al archivo JSON de frases
const phrasesPath = path.join(__dirname, '../utils/phrases.json');

// Función para obtener una frase aleatoria de un array
const getRandomPhrase = (array) => {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
};

// Endpoint para obtener una frase aleatoria
router.get('/', async (req, res) => {
    try {
        // Leer el archivo JSON
        const data = await fs.readFile(phrasesPath, 'utf8');
        const phrases = JSON.parse(data);
        
        // Combinar todas las frases en un solo array
        const allPhrases = [
        ...phrases.motivacionales,
        ...phrases.divertidas
        ];
        
        // Obtener una frase aleatoria
        const randomPhrase = getRandomPhrase(allPhrases);
        
        res.json({
        frase: randomPhrase,
        timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('Error obteniendo frase:', err);
        res.status(500).json({ error: 'Error obteniendo frase motivacional' });
    }
});

// Endpoint opcional para obtener frases por categoría
router.get('/:categoria', async (req, res) => {
    try {
        const { categoria } = req.params;
        const data = await fs.readFile(phrasesPath, 'utf8');
        const phrases = JSON.parse(data);
        
        if (phrases[categoria]) {
        const randomPhrase = getRandomPhrase(phrases[categoria]);
        res.json({
            categoria,
            frase: randomPhrase,
            timestamp: new Date().toISOString()
        });
        } else {
        res.status(404).json({ error: 'Categoría no encontrada' });
        }
        
    } catch (err) {
        console.error('Error obteniendo frase por categoría:', err);
        res.status(500).json({ error: 'Error obteniendo frase' });
    }
});

module.exports = router;
