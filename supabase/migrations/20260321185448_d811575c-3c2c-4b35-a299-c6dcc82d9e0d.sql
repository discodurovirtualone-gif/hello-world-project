
-- Step 1: Drop ALL text defaults for columns we're converting
ALTER TABLE public.registros_basicos 
  ALTER COLUMN fecha_nacimiento DROP DEFAULT,
  ALTER COLUMN lactancia DROP DEFAULT,
  ALTER COLUMN edad DROP DEFAULT,
  ALTER COLUMN potencial_vaca DROP DEFAULT;

ALTER TABLE public.registros_basicos
  ALTER COLUMN fecha_nacimiento TYPE date USING NULLIF(fecha_nacimiento,'')::date,
  ALTER COLUMN lactancia TYPE integer USING NULLIF(lactancia,'')::integer,
  ALTER COLUMN edad TYPE integer USING NULLIF(edad,'')::integer;

ALTER TABLE public.registros_productivos
  ALTER COLUMN reg_1_dia30 DROP DEFAULT,
  ALTER COLUMN reg_2_dia120 DROP DEFAULT,
  ALTER COLUMN reg_3_dia210 DROP DEFAULT,
  ALTER COLUMN reg_4_dia270 DROP DEFAULT,
  ALTER COLUMN lc305_wood DROP DEFAULT,
  ALTER COLUMN porcentaje_grasa DROP DEFAULT,
  ALTER COLUMN porcentaje_proteina DROP DEFAULT,
  ALTER COLUMN lact1 DROP DEFAULT,
  ALTER COLUMN lact2 DROP DEFAULT,
  ALTER COLUMN lact3 DROP DEFAULT,
  ALTER COLUMN lact4 DROP DEFAULT,
  ALTER COLUMN lact5 DROP DEFAULT;

ALTER TABLE public.registros_productivos
  ALTER COLUMN reg_1_dia30 TYPE numeric USING NULLIF(reg_1_dia30,'')::numeric,
  ALTER COLUMN reg_2_dia120 TYPE numeric USING NULLIF(reg_2_dia120,'')::numeric,
  ALTER COLUMN reg_3_dia210 TYPE numeric USING NULLIF(reg_3_dia210,'')::numeric,
  ALTER COLUMN reg_4_dia270 TYPE numeric USING NULLIF(reg_4_dia270,'')::numeric,
  ALTER COLUMN lc305_wood TYPE numeric USING NULLIF(lc305_wood,'')::numeric,
  ALTER COLUMN porcentaje_grasa TYPE numeric USING NULLIF(porcentaje_grasa,'')::numeric,
  ALTER COLUMN porcentaje_proteina TYPE numeric USING NULLIF(porcentaje_proteina,'')::numeric,
  ALTER COLUMN lact1 TYPE numeric USING NULLIF(lact1,'')::numeric,
  ALTER COLUMN lact2 TYPE numeric USING NULLIF(lact2,'')::numeric,
  ALTER COLUMN lact3 TYPE numeric USING NULLIF(lact3,'')::numeric,
  ALTER COLUMN lact4 TYPE numeric USING NULLIF(lact4,'')::numeric,
  ALTER COLUMN lact5 TYPE numeric USING NULLIF(lact5,'')::numeric;

ALTER TABLE public.registros_reproductivos
  ALTER COLUMN parto DROP DEFAULT,
  ALTER COLUMN parto1 DROP DEFAULT,
  ALTER COLUMN servicio1 DROP DEFAULT,
  ALTER COLUMN servicio2 DROP DEFAULT,
  ALTER COLUMN servicio3 DROP DEFAULT,
  ALTER COLUMN concepcion1 DROP DEFAULT,
  ALTER COLUMN aborto1 DROP DEFAULT,
  ALTER COLUMN aborto2 DROP DEFAULT,
  ALTER COLUMN iip DROP DEFAULT,
  ALTER COLUMN ipc DROP DEFAULT,
  ALTER COLUMN serv_conc DROP DEFAULT,
  ALTER COLUMN raza DROP DEFAULT;

-- Delete rows with invalid date serial numbers before converting
DELETE FROM public.registros_reproductivos WHERE servicio1 ~ '^\d{5}$' OR servicio2 ~ '^\d{5}$' OR parto ~ '^\d{5}$';

ALTER TABLE public.registros_reproductivos
  ALTER COLUMN parto TYPE date USING NULLIF(parto,'')::date,
  ALTER COLUMN parto1 TYPE date USING NULLIF(parto1,'')::date,
  ALTER COLUMN servicio1 TYPE date USING NULLIF(servicio1,'')::date,
  ALTER COLUMN servicio2 TYPE date USING NULLIF(servicio2,'')::date,
  ALTER COLUMN servicio3 TYPE date USING NULLIF(servicio3,'')::date,
  ALTER COLUMN concepcion1 TYPE date USING NULLIF(concepcion1,'')::date,
  ALTER COLUMN aborto1 TYPE date USING NULLIF(aborto1,'')::date,
  ALTER COLUMN aborto2 TYPE date USING NULLIF(aborto2,'')::date,
  ALTER COLUMN iip TYPE numeric USING NULLIF(iip,'')::numeric,
  ALTER COLUMN ipc TYPE numeric USING NULLIF(ipc,'')::numeric,
  ALTER COLUMN serv_conc TYPE numeric USING NULLIF(serv_conc,'')::numeric;

ALTER TABLE public.registros_otros
  ALTER COLUMN renguera DROP DEFAULT,
  ALTER COLUMN mastitis DROP DEFAULT,
  ALTER COLUMN fac_parto DROP DEFAULT,
  ALTER COLUMN longevidad DROP DEFAULT,
  ALTER COLUMN fortaleza_patas DROP DEFAULT;

ALTER TABLE public.registros_otros
  ALTER COLUMN renguera TYPE integer USING NULLIF(renguera,'')::integer,
  ALTER COLUMN mastitis TYPE integer USING NULLIF(mastitis,'')::integer,
  ALTER COLUMN fac_parto TYPE integer USING NULLIF(fac_parto,'')::integer,
  ALTER COLUMN longevidad TYPE integer USING NULLIF(longevidad,'')::integer,
  ALTER COLUMN fortaleza_patas TYPE integer USING NULLIF(fortaleza_patas,'')::integer;
