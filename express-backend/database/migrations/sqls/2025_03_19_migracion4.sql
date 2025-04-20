--Hubo una confusión entre las migraciones, lo que duplicó las tablas. Este script soluciona eso. 

DROP TABLE IF EXISTS 
"Roles","Permisos","Permisos_Roles","Tipos_Movimientos_Inventario","Categorias","Proveedores",
"Estados_Calendarios","Usuarios","Locales","Clientes","Productos","Promociones","Visitadores_Medicos","Lotes","Ventas",
"Compras","Pagos_Compras","Inventario","Facturas","Recetas","Documentos_Locales","Promociones_Producto","Categorias_Productos",
"Catalogos_Visitadores","Calendario","Telefonos"
CASCADE;
