-- datos de prueba para poblar ventas 
insert into ventas (cliente_id,total,tipo_pago,encargado_id)
values (2,250.00,'efectivo',12), (10,350.00,'efectivo',3),(5,20.00,'tarjeta',2),(4,100.00,'transacción',3),(7,80.00,'efectivo',12),(9,500.00,'tarjeta',12);


insert into venta_detalle (venta_id,producto_id,lote_id,cantidad,precio_unitario,descuento,subtotal)
values (12,5,5,21,12.0,2.0,250),(13,8,8,100,3.50,0.0,350),(14,1,1,2,10.0,0.0,20.0),(15,9,9,2,50.0,0.0,100.0),(16,10,10,2,40.0,0.0,80),(17,9,9,11,50.0,50.0,500);

insert into inventario (lote_id,cantidad,tipo_movimiento_id,venta_id,precio_venta,local_id,encargado_id)
values (5,21,2,12,250,1,12), (8,100,2,13,350,2,3),(1,2,2,14,20,2,2),(9,2,2,15,100,2,3),(10,2,2,16,80,1,12),(9,11,2,17,500,1,12);
