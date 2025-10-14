UPDATE productos p
SET imagen = datos.url
FROM (
    VALUES
        (1, 'https://res.cloudinary.com/dokere5ey/image/upload/v1754450906/levofloxacina_1_x7oolc.png'),
        (2, 'https://res.cloudinary.com/dokere5ey/image/upload/v1754452647/amoxicilina_ygeghm.png'),
        (3, 'https://res.cloudinary.com/dokere5ey/image/upload/v1754452664/metformina_hxr4q1.png'),
        (4, 'https://res.cloudinary.com/dokere5ey/image/upload/v1754452669/metformina2_neiszm.png'),
        (5, 'https://res.cloudinary.com/dokere5ey/image/upload/v1754452674/metformina3_acysam.png'),
        (6, 'https://res.cloudinary.com/dokere5ey/image/upload/v1754452690/prenatales_dplinu.png'),
        (7, 'https://res.cloudinary.com/dokere5ey/image/upload/v1754452691/pyrex_awfobr.png'),
        (8, 'https://res.cloudinary.com/dokere5ey/image/upload/v1754452703/esomeprazol_llxjzy.png'),
        (9, 'https://res.cloudinary.com/dokere5ey/image/upload/v1754452706/neurofortan_kyk5tx.png'),
        (10, 'https://res.cloudinary.com/dokere5ey/image/upload/v1754452709/neurofortan2_jv1ysu.png')
) AS datos(codigo, url)
WHERE p.codigo = datos.codigo;
