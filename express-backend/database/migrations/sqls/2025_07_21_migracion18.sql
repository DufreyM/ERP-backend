update calendario set local_id = 1 where id <=5;
update calendario set local_id = 2 where id >5 and id <= 10;

insert into calendario (usuario_id, titulo, estado_id, detalles, fecha, local_id, tipo_evento_id)
VALUES (15, 'Conferencia sobre existencia de kilogramos de piscina', 1, 'Congreso internacional para la teorización de la existencia de los rumoreados kg de piscinas','2025-07-25 03:33:33',1, 2),
(12, 'Comprar USB', 2, 'Conseguirlo a menos de Q70','2025-07-25 14:00:00',1, 3),
(14, 'Comprar decoración de oficina', 3, 'Pedir en VH3','2025-07-19',2, 3),
(10, 'Muestra de contaduría', 1, 'Reunión para plática de rendimiento trimestral','2025-08-20',2, 2),
(2, 'Entregar facturas del mes al contador', 2, 'Vendrá vestido de verde caqui','2025-08-31 12:00:00',2, 3),
(3, 'Venta al por mayor para hospital', 3, 'Se debe aplicar descuento debido a por mayor','2025-06-06 10:00:00',2, 3);

INSERT INTO calendario (usuario_id, visitador_id, titulo, estado_id, detalles, fecha, local_id, tipo_evento_id)
VALUES (1, 3, 'Promoción de acetaminofén', 3, 'Oferta 3x1','2025-06-21',1, 1),
(11,11, 'Promoción del clan', 2, 'Para lograr mayor conexión','2025-07-25 19:30:00',1, 1);
