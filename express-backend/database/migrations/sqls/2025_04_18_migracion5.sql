INSERT INTO Roles (nombre)
VALUES ('Administrador'),
       ('Dependiente'),
       ('Visitador Médico'),
       ('Contador');

SELECT * FROM Roles; 

INSERT INTO Usuarios (nombre, apellidos, rol_id, email, status, local, contrasena, fechanacimiento, creacion) 
VALUES
	('Ana', 'García', 1, 'ana.garcia@example.com', 'activo', 1, 'password456', '1985-12-20', NOW()),
	('Pedro', 'Rodríguez', 2, 'pedro.rodriguez@example.com', 'inactivo', 2, 'password789', '1978-03-08', NOW()),
	('Laura', 'Martínez', 2, 'laura.martinez@example.com', 'activo', 3, 'password000', '1992-07-12', NOW()),
	('Miguel', 'Fernández', 3, 'miguel.fernandez@example.com', 'activo', 4, 'password111', '1989-01-05', NOW()),
	('Sofia', 'López', 3, 'sofia.lopez@example.com', 'inactivo', 5, 'password222', '1995-09-28', NOW()),
	('Javier', 'Sánchez', 3, 'javier.sanchez@example.com', 'activo', 6, 'password333', '1982-06-18', NOW()),
	('Maria', 'González', 3, 'maria.gonzalez@example.com', 'activo', 7, 'password444', '1998-04-02', NOW()),
	('David', 'Alonso', 3, 'david.alonso@example.com', 'inactivo', 8, 'password555', '1987-11-10', NOW()),
	('Elena', 'Romero', 3, 'elena.romero@example.com', 'activo', 9, 'password666', '1991-08-25', NOW()),
	('Carlos', 'Hernández', 4, 'carlos.hernandez@example.com', 'activo', 10, 'password777', '1984-03-15', NOW());

SELECT * FROM Usuarios;

INSERT INTO Locales (administrador_id, nombre, direccion, nit_emisor)
VALUES 
	(1, 'Farmacia Central', 'Av. Principal #123', '12345678-9'),
	(2, 'Farmacia 2', 'Av. Principal #456', '12345678-9');

SELECT * FROM Locales;

INSERT INTO Documentos_Locales (nombre, usuario_id, archivo, local_id, vencimiento)
VALUES 
	('Licencia Sanitaria', 1, 'licencia.pdf', 1, '2026-12-31'),
	('Patente de farmacia', 1, 'patente de farmacia.pdf', 1, '2025-01-31'),
	('Patente de salud', 1, 'patente de salud.pdf', 1, '2025-01-31'),
	('Tarjeta de salud', 1, 'tarjeta de salud.pdf', 1, '2025-01-31'),
	('Patente de farmacia', 1, 'patente de farmacia.pdf', 2, '2025-01-31'),
	('Patente de salud', 1, 'patente de salud.pdf', 2, '2025-01-31'),
	('Tarjeta de salud', 1, 'tarjeta de salud.pdf', 2, '2025-01-31');

SELECT * FROM Documentos_Locales;

INSERT INTO Permisos (nombre, descripcion)
VALUES 
	('Agregar usuario', 'Permite agregar un usuario en el sistema'),
	('Eliminar usuario', 'Permite eliminar un usuario en el sistema'),
	('Actualizar usuario', 'Permite actualizar la información de un usuario en el sistema'),
	('Estado', 'Permite cambiar el estado de un usuario en el sistema');

INSERT INTO Permisos_Roles (rol_id, permiso_id)
VALUES (1, 1);

INSERT INTO Proveedores (nombre, direccion, correo) 
VALUES
	('Andifar', 'Av. Principal 123', 'andifar@ejemplo.com'),
	('Chemilco', 'Calle Industria 456', 'chemico@ejemplo.com'),
	('Donovan', 'Carretera Nacional 789', 'donovan@ejemplo.com'),
	('Finlay', 'Blvd. Empresarial 101', 'finlay@ejemplo.com'),
	('H&V', 'Calle Comercial 222', 'hv@ejemplo.com'),
	('Hessel', 'Av. Progreso 333', 'hessel@ejemplo.com'),
	('Infasa', 'Calle Mayor 444', 'infasa@ejemplo.com'),
	('Lafco', 'Zona Franca 555', 'lafco@ejemplo.com'),
	('Legsa', 'Calle Industrial 666', 'legsa@ejemplo.com'),
	('Mediproducts', 'Av. Salud 777', 'mediproducts@ejemplo.com'),
	('Merck', 'Calle Ciencia 888', 'merck@ejemplo.com'),
	('Moneraux', 'Av. Tecnología 999', 'moneraux@ejemplo.com'),
	('Pharmamedica', 'Calle Medica 100', 'pharmamedica@ejemplo.com'),
	('Pharland', 'Av. Farmacia 200', 'pharland@ejemplo.com'),
	('Phara', 'Calle Saludable 300', 'phara@ejemplo.com'),
	('Pheniel', 'Av. Innovación 400', 'pheniel@ejemplo.com'),
	('Piersan', 'Calle Química 500', 'piersan@ejemplo.com'),
	('Pisa', 'Av. Desarrollo 600', 'pisa@ejemplo.com'),
	('Populares', 'Calle Comercial 700', 'populares@ejemplo.com'),
	('Profar', 'Av. Farmacéutica 800', 'profar@ejemplo.com'),
	('Selectpharma', 'Calle Principal 900', 'selectpharma@ejemplo.com'),
	('Varios', 'Av. General 1000', 'varios@ejemplo.com'),
	('Vizcaino', 'Calle Central 111', 'vizcaino@ejemplo.com');

SELECT * FROM Proveedores;

INSERT INTO Visitadores_Medicos (nombre, proveedor_id, correo) VALUES
('Carlos Rodríguez', 1, 'carlos.rodriguez@ejemplo.com'),
('Ana García', 2, 'ana.garcia@ejemplo.com'),
('Juan Pérez', 3, 'juan.perez@ejemplo.com'),
('Maria López', 4, 'maria.lopez@ejemplo.com'),
('Pedro Martínez', 5, 'pedro.martinez@ejemplo.com'),
('Laura Hernández', 6, 'laura.hernandez@ejemplo.com'),
('David González', 7, 'david.gonzalez@ejemplo.com'),
('Sofia Sánchez', 8, 'sofia.sanchez@ejemplo.com'),
('Antonio Moreno', 9, 'antonio.moreno@ejemplo.com'),
('Isabel Ruiz', 10, 'isabel.ruiz@ejemplo.com');

SELECT * FROM Visitadores_Medicos;

INSERT INTO Telefonos (numero, tipo, usuario_id) VALUES
	('1234567', 'móvil', 1),
	('9876543', 'fijo', 2),
	('1357924', 'móvil', 3),
	('2468013', 'fijo', 4),
	('3691258', 'móvil', 5),
	('4813579', 'fijo', 6),
	('6035814', 'móvil', 7),
	('7258136', 'fijo', 8),
	('8471359', 'móvil', 9),
	('9637148', 'fijo', 10);

SELECT * FROM Telefonos;

INSERT INTO Clientes (nombre, nit, direccion, correo) 
VALUES
	('Juan Pérez', '12345678-9', 'Av. Principal 456', 'juan.perez@example.com'),
	('Ana García', '98765432-1', 'Calle Secundaria 789', 'ana.garcia@example.com'),
	('Pedro López', '13579246-8', 'Calle Larga 101', 'pedro.lopez@example.com'),
	('María Martínez', '24680135-7', 'Avenida Central 222', 'maria.martinez@example.com'),
	('Luis Rodríguez', '36912584-6', 'Calle Tranquila 333', 'luis.rodriguez@example.com'),
	('Sofia Hernández', '48135796-5', 'Calle Alegre 444', 'sofia.hernandez@example.com'),
	('Carlos González', '60358147-4', 'Avenida del Sol 555', 'carlos.gonzalez@example.com'),
	('Isabel Sánchez', '72581369-3', 'Calle Bonita 666', 'isabel.sanchez@example.com'),
	('Javier Moreno', '84713592-2', 'Calle Verde 777', 'javier.moreno@example.com'),
	('Elena Ruiz', '96371481-1', 'Avenida de los Ríos 888', 'elena.ruiz@example.com');

SELECT * FROM Clientes;

INSERT INTO Productos (nombre, presentacion, proveedor_id, precioVenta, precioCosto, receta, stock_minimo, detalles) 
VALUES
	('Levofloxacina', 'Tabletas 500 mg x 30 comprimidos', 1, 10.00, 6.00, TRUE, 10, 'Antibiótico de amplio espectro'),
	('Amoxicilina', 'Cápsulas 500 mg x 50', 2, 2.00, 1.20, TRUE, 20, 'Antibiótico betalactámico'),
	('Metformina 850mg', 'Comprimidos 850mg', 3, 12.00, 7.20, FALSE, 5, 'Antidiabético oral'),
	('Metformina Clorhidrato Glibencamida', 'Comprimidos 850mg', 4, 12.00, 7.20, FALSE, 10, 'Antidiabético oral de combinación'),
	('Metformina 1000mg', 'Comprimidos 1000 mg', 5, 12.00, 7.20, FALSE, 5, 'Antidiabético oral'),
	('Vitaminas Prenatales', 'Tabletas recubiertas x 100', 6, 7.50, 4.50, FALSE, 20, 'Suplemento vitamínico para el embarazo'),
	('Pyrex Sildenafil', 'Tabletas 100 mg', 7, 15.00, 9.00, FALSE, 2, 'Medicamento para la disfunción eréctil'),
	('Esomeprazol', 'Cápsulas 40mg', 8, 3.50, 2.10, FALSE, 15, 'Inhibidor de la bomba de protones'),
	('Neurofotan Jarabe 240ml', 'Jarabe 240 ml', 9, 50.00, 30.00, FALSE, 1, 'Suplemento o medicamento para el sistema nervioso'),
	('Neurofotan x30 cápsulas', 'Cápsulas 30mg', 10, 40.00, 24.00, FALSE, 2, 'Suplemento o medicamento para el sistema nervioso');

SELECT * FROM Productos;

INSERT INTO Lotes (producto_id, lote, fecha_vencimiento) VALUES
	(1, 'LOTE-001', '2024-12-31'),
	(2, 'LOTE-002', '2024-06-30'),
	(3, 'LOTE-003', '2025-01-15'),
	(4, 'LOTE-004', '2024-11-10'),
	(5, 'LOTE-005', '2024-09-20'),
	(6, 'LOTE-006', '2025-03-01'),
	(7, 'LOTE-007', '2024-08-15'),
	(8, 'LOTE-008', '2024-10-25'),
	(9, 'LOTE-009', '2025-02-28'),
	(10, 'LOTE-010', '2024-07-10');

SELECT * FROM Lotes;

INSERT INTO Tipos_Movimientos_Inventario (nombre) 
VALUES 
    ('Ingreso por compra'),
    ('Nuevo'),
    ('Editar'),
    ('Actualizar'),
    ('Historial de pedidos');

INSERT INTO Ventas (cliente_id, total, tipo_pago) 
VALUES
	(1, 50.00, 'efectivo'),
	(2, 75.50, 'tarjeta'),
	(3, 20.00, 'efectivo'),
	(4, 100.00, 'transacción'),
	(5, 35.75, 'tarjeta'),
	(6, 15.00, 'efectivo'),
	(7, 90.00, 'transacción'),
	(8, 45.25, 'tarjeta'),
	(9, 60.00, 'efectivo'),
	(10, 80.00, 'transacción');

SELECT * FROM Ventas;

INSERT INTO Facturas (venta_id, local_id, no_serie, numero_dte, autorizacion, moneda) 
VALUES
	(1, 1, 'A002', '123456', '12345678901234567890', 'Q'),
	(2, 2, 'B003', '123456', '98765432101234567890', 'Q'),
	(3, 1, 'C004', '123456', '14725836901234567890', 'Q'),
	(4, 1, 'A0012', '123456', '36912587401234567890', 'Q'),
	(5, 2, 'B0024', '123456', '24680135701234567890', 'Q'),
	(6, 2, 'C0034', '123456', '75319246001234567890', 'Q'),
	(7, 1, 'A0071', '123456', '59731428001234567890', 'Q'),
	(8, 2, 'B0052', '123456', '86420153901234567890', 'Q'),
	(9, 2, 'C0023', '123456', '91827364501234567890', 'Q'),
	(10, 1, 'A0011', '123456', '13579246801234567890', 'Q');

SELECT * FROM Facturas;

INSERT INTO Compras (no_factura, usuario_id, proveedor_id, total, credito, descripcion) 
VALUES
	(123456, 1, 1, 200.00, TRUE, 'Compra de medicamentos'),
	(123445, 2, 2, 150.00, FALSE, 'Compra de material de oficina'),
	(165145, 3, 3, 300.00, TRUE, 'Compra de equipos de computo'),
	(213489, 1, 4, 100.00, FALSE, 'Compra de insumos para producción'),
	(263165, 2, 5, 250.00, TRUE, 'Compra de muebles para la oficina'),
	(897465, 3, 6, 175.00, FALSE, 'Compra de software para la empresa'),
	(216549, 1, 7, 400.00, TRUE, 'Compra de materiales de construcción'),
	(156475, 2, 8, 125.00, FALSE, 'Compra de uniformes para el personal'),
	(156754, 3, 9, 350.00, TRUE, 'Compra de herramientas para el taller'),
	(126548, 1, 10, 225.00, FALSE, 'Compra de servicios de mantenimiento');

SELECT * FROM Compras;

INSERT INTO Inventario (lote_id, cantidad, tipo_movimiento_id, precio_venta, precio_costo, local_id, encargado_id)
VALUES 
	(1, 50, 2, 120.00, 90.00, 1, 3),
	(2, 30, 1, 200.00, 150.00, 2, 5),
	(3, 20, 2, 75.00, 50.00, 1, 4),
	(4, 100, 3, 50.00, 30.00, 1, 2),
	(5, 60, 1, 90.00, 70.00, 2, 1),
	(6, 80, 2, 110.00, 85.00, 1, 3),
	(7, 45, 1, 130.00, 95.00, 2, 5),
	(8, 25, 3, 200.00, 160.00, 2, 4),
	(9, 90, 2, 175.00, 140.00, 1, 2),
	(10, 55, 1, 95.00, 65.00, 2, 1);

INSERT INTO Pagos_Compras (compra_id, cuotas, estado, total, fecha, detalles) 
VALUES 
	(1, 2, 'pendiente', 150.00, '2025-03-20 12:00:00', 'Pago inicial de la compra'),
	(2, 3, 'pagado', 200.00, '2025-03-21 14:00:00', 'Compra de artículos varios'),
	(3, 1, 'pendiente', 50.00, '2025-03-22 16:00:00', 'Pago único por servicio'),
	(4, 4, 'pagado', 250.00, '2025-03-23 18:00:00', 'Compra de un producto en oferta'),
	(5, 2, 'pendiente', 100.00, '2025-03-24 20:00:00', 'Pago parcial de una compra grande'),
	(6, 1, 'pagado', 75.00, '2025-03-25 22:00:00', 'Pago final de una compra pequeña'),
	(7, 3, 'pendiente', 175.00, '2025-03-26 00:00:00', 'Compra de un artículo de lujo'),
	(8, 2, 'pagado', 125.00, '2025-03-27 02:00:00', 'Pago de una suscripción anual'),
	(9, 1, 'pendiente', 60.00, '2025-03-28 04:00:00', 'Pago por un servicio de entrega'),
	(10, 4, 'pagado', 225.00, '2025-03-29 06:00:00', 'Compra de un producto de tecnología');


INSERT INTO Categorias (nombre) 
VALUES 
	('Antibiótico'), 
	('Antidiabético'), 
	('Suplemento vitamínico prenatal'), 
	('Medicamento para la disfunción eréctil'), 
	('Inhibidor de la bomba de protones'), 
	('Suplemento o medicamento para el sistema nervioso'), 
	('Antihistamínico'), 
	('Anti-inflamatorio no esteroideo'), 
	('Antiepiléptico'), 
	('Suplemento vitamínico'), 
	('Suplemento digestivo'), 
	('Suplemento omega-3'), 
	('Suplemento mineral'), 
	('Suplemento multivitamínico'), 
	('Antiinflamatorio tópico'), 
	('Relajante muscular'), 
	('Antihipertensivo'), 
	('Anticolesterolémico'), 
	('Antigripal'), 
	('Corticosteroide'), 
	('Analgésico');

INSERT INTO Categorias_Productos (categoria_id, producto_id) VALUES
	(1, 1),
	(1, 2),
	(2, 3),
	(2, 4), 
	(2, 5),
	(3, 6),
	(4, 7),
	(5, 8),
	(6, 9),
	(6, 10);

SELECT * FROM Categorias_Productos;

INSERT INTO Estados_Calendarios (nombre)
VALUES 
	('Confirmado'),
	('Pendiente'),
	('Terminado');

SELECT * FROM Estados_Calendarios;

INSERT INTO Calendario (usuario_id, visitador_id, titulo, estado_id, detalles, fecha) VALUES
(1, 1, 'Reunión con Visitador Médico', 1, 'Revisión de nuevos productos', '2025-04-01 14:00:00'),
(2, 2, 'Presentación de productos', 2, 'Presentación de la nueva línea de analgésicos', '2025-04-02 10:00:00'),
(3, 3, 'Visita a consultorio médico', 3, 'Entrega de muestras y folletos', '2025-04-03 16:00:00'),
(4, 4, 'Capacitación médica', 1, 'Actualización sobre nuevas terapias', '2025-04-04 09:00:00'),
(5, 5, 'Reunión con equipo de ventas', 2, 'Estrategias de marketing para nuevos productos', '2025-04-05 11:00:00'),
(6, 6, 'Visita a farmacia', 3, 'Promoción de productos y ofertas', '2025-04-06 17:00:00'),
(7, 7, 'Charla informativa', 1, 'Beneficios de los productos para la salud', '2025-04-07 13:00:00'),
(8, 8, 'Reunión con gerente de ventas', 2, 'Análisis de resultados y objetivos', '2025-04-08 15:00:00'),
(9, 9, 'Visita a hospital', 3, 'Presentación de productos a médicos especialistas', '2025-04-09 10:00:00'),
(10, 10, 'Taller de capacitación', 1, 'Manejo de productos y protocolos de seguridad', '2025-04-10 14:00:00');
