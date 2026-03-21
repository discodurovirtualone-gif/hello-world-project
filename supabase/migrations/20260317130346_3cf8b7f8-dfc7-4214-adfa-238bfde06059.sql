
-- Registros Básicos
CREATE TABLE public.registros_basicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ejercicio text NOT NULL DEFAULT '',
  id_vaca text NOT NULL,
  partos text NOT NULL DEFAULT '',
  fecha_nacimiento text DEFAULT '',
  raza text NOT NULL DEFAULT '',
  lactancia text NOT NULL DEFAULT '',
  edad text DEFAULT '',
  potencial_vaca text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Registros Productivos
CREATE TABLE public.registros_productivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ejercicio text NOT NULL DEFAULT '',
  id_vaca text NOT NULL,
  reg_1_dia30 text DEFAULT '',
  reg_2_dia120 text DEFAULT '',
  reg_3_dia210 text DEFAULT '',
  reg_4_dia270 text DEFAULT '',
  lc305_wood text DEFAULT '',
  porcentaje_grasa text DEFAULT '',
  porcentaje_proteina text DEFAULT '',
  lact1 text DEFAULT '',
  lact2 text DEFAULT '',
  lact3 text DEFAULT '',
  lact4 text DEFAULT '',
  lact5 text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Registros Reproductivos
CREATE TABLE public.registros_reproductivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_vaca text NOT NULL,
  ejercicio text NOT NULL DEFAULT '',
  parto text DEFAULT '',
  raza text DEFAULT '',
  servicio1 text DEFAULT '',
  servicio2 text DEFAULT '',
  servicio3 text DEFAULT '',
  concepcion1 text DEFAULT '',
  toro_usado text DEFAULT '',
  aborto1 text DEFAULT '',
  aborto2 text DEFAULT '',
  parto1 text DEFAULT '',
  iip text DEFAULT '',
  ipc text DEFAULT '',
  serv_conc text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Registros Otros
CREATE TABLE public.registros_otros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_vaca text NOT NULL,
  ejercicio text NOT NULL DEFAULT '',
  renguera text DEFAULT '',
  mastitis text DEFAULT '',
  fac_parto text DEFAULT '',
  longevidad text DEFAULT '',
  fortaleza_patas text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Toros
CREATE TABLE public.toros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_toro text NOT NULL,
  nombre text DEFAULT '',
  dep_leche numeric DEFAULT 0,
  dep_grasa numeric DEFAULT 0,
  dep_prot numeric DEFAULT 0,
  dep_tph numeric DEFAULT 0,
  indice_inia numeric DEFAULT 0,
  indice_rovere numeric DEFAULT 0,
  caracteristicas text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies: public access for now (no auth)
CREATE POLICY "Allow all on registros_basicos" ON public.registros_basicos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on registros_productivos" ON public.registros_productivos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on registros_reproductivos" ON public.registros_reproductivos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on registros_otros" ON public.registros_otros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on toros" ON public.toros FOR ALL USING (true) WITH CHECK (true);
