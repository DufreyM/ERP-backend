const cron = require('node-cron');
const crearNotificacionesDeStockMinimo = require('../services/notificacionesStockMinimo');

cron.schedule('0 8 * * *', async () => {
    console.log('Verificando stock mínimo para todos los locales...');
    await crearNotificacionesDeStockMinimo({ id: 1 }, [1, 2]);
});
