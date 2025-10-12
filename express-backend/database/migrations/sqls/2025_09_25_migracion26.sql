update inventario set tipo_movimiento_id = 1 where id <= 4; 

update inventario set precio_venta = null where id = 1;
update inventario set precio_venta = null where id = 2;
update inventario set precio_venta = null where id = 3;
update inventario set precio_venta = null where id = 4;

update inventario set compra_id = 5 where id = 1;
update inventario set compra_id = 2 where id = 2;
update inventario set compra_id = 4 where id = 3;
update inventario set compra_id = 9 where id = 4;
