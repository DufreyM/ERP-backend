INSERT INTO documentos_locales (nombre,usuario_id,archivo,local_id,vencimiento) 
VALUES ('Estado de cuenta julio 2025', 11,'https://guao.org/sites/default/files/biblioteca/%C3%81lgebra%20de%20Baldor.pdf',1,'2025-12-15'),
('Contaduría julio 2025',13,'https://drive.google.com/file/d/1CQ1k22FTyIVmnlDiqLmcxGuJhwjUPn0g/view?usp=sharing',2,'2026-10-17'),
('Encargo de 3kg de piscina', 15,'https://drive.google.com/file/d/1GGMrpgcdwk5fA3AhZj3DY0DZhe0OWpbq/view?usp=sharing',1,'2050-01-01'),
('Pedido de paracetamol',12,'https://drive.google.com/file/d/1OjIReXghb5R1QwI1-AHI_ujYhBsThnTj/view?usp=sharing',1,'2026-06-01'),
('Factura compra de estanterías',14,'https://drive.google.com/file/d/1M26DqDimn5KGQnwe2aMyYPkIwl1dvYiX/view?usp=sharing',2,'2027-01-01'),
('Registro de ingreso de jeringas',4,'https://drive.google.com/file/d/1CQ1k22FTyIVmnlDiqLmcxGuJhwjUPn0g/view?usp=sharing',2,'2026-03-10'),
('Promocion de vitaminas 2x1',7,'https://drive.google.com/file/d/1CQ1k22FTyIVmnlDiqLmcxGuJhwjUPn0g/view?usp=sharing',1,'2025-07-13'),
('Encargo de yeso',2,'https://drive.google.com/file/d/1CQ1k22FTyIVmnlDiqLmcxGuJhwjUPn0g/view?usp=sharing',2,'2030-01-01'),
('Aviso SAT',1,'https://drive.google.com/file/d/1CQ1k22FTyIVmnlDiqLmcxGuJhwjUPn0g/view?usp=sharing',1,'2027-01-01'),
('Recibo de luz',11,'https://drive.google.com/file/d/1CQ1k22FTyIVmnlDiqLmcxGuJhwjUPn0g/view?usp=sharing',2,'2025-08-15');


UPDATE visitadores_medicos SET usuario_id = 4 WHERE id < 3;
UPDATE visitadores_medicos SET usuario_id = 5 WHERE id >=3 and id <6;
UPDATE visitadores_medicos SET usuario_id = 6 WHERE id =6;
UPDATE visitadores_medicos SET usuario_id = 7 WHERE id =7;
UPDATE visitadores_medicos SET usuario_id = 8 WHERE id =8;
UPDATE visitadores_medicos SET usuario_id = 9 WHERE id =9;
UPDATE visitadores_medicos SET usuario_id = 14 WHERE id =10;

-- si fuera necesario, aqui se puede settear en null los locales de los visitadores-medicos