-- ============================================================
-- Ejercicios globales — ejecutar después de schema.sql
-- ============================================================

INSERT INTO public.exercises (name, muscle_group, description, is_global) VALUES
-- Pecho
('Press banca plano', 'Pecho', 'Press con barra en banco plano', true),
('Press banca inclinado', 'Pecho', 'Press con barra en banco inclinado 45°', true),
('Press banca declinado', 'Pecho', 'Press en banco declinado', true),
('Aperturas con mancuernas', 'Pecho', 'Aperturas en banco plano', true),
('Fondos en paralelas', 'Pecho', 'Fondos focalizados en pecho', true),
('Press con mancuernas plano', 'Pecho', 'Press con mancuernas en banco plano', true),
('Pullover con mancuerna', 'Pecho', 'Pullover tumbado en banco', true),
('Crossover en polea', 'Pecho', 'Cruce de poleas para pecho', true),

-- Espalda
('Dominadas', 'Espalda', 'Dominadas con agarre pronado', true),
('Remo con barra', 'Espalda', 'Remo con barra inclinado', true),
('Remo con mancuerna', 'Espalda', 'Remo unilateral con mancuerna', true),
('Jalón al pecho', 'Espalda', 'Jalón en polea alta al pecho', true),
('Jalón trasnuca', 'Espalda', 'Jalón en polea alta detrás de la cabeza', true),
('Remo en polea baja', 'Espalda', 'Remo sentado en polea baja', true),
('Pull-over en polea', 'Espalda', 'Extensión de hombro en polea', true),
('Peso muerto rumano', 'Espalda', 'Peso muerto con piernas semiflexionadas', true),

-- Hombros
('Press militar', 'Hombros', 'Press de hombros con barra de pie', true),
('Press Arnold', 'Hombros', 'Press con rotación de mancuernas', true),
('Elevaciones laterales', 'Hombros', 'Elevaciones laterales con mancuernas', true),
('Elevaciones frontales', 'Hombros', 'Elevaciones al frente con mancuernas', true),
('Pájaro o elevaciones posteriores', 'Hombros', 'Elevaciones para deltoides posterior', true),
('Press en máquina', 'Hombros', 'Press de hombros en máquina', true),

-- Bíceps
('Curl con barra', 'Bíceps', 'Curl de bíceps con barra recta', true),
('Curl con mancuernas alterno', 'Bíceps', 'Curl alternado con mancuernas', true),
('Curl martillo', 'Bíceps', 'Curl con agarre neutro', true),
('Curl concentrado', 'Bíceps', 'Curl concentrado sentado', true),
('Curl en polea baja', 'Bíceps', 'Curl de bíceps en cable', true),
('Curl en banco predicador', 'Bíceps', 'Curl en banco Scott', true),

-- Tríceps
('Press francés', 'Tríceps', 'Press francés con barra EZ', true),
('Extensión en polea', 'Tríceps', 'Extensión de tríceps en polea alta', true),
('Fondos en banco', 'Tríceps', 'Fondos con manos en banco', true),
('Patada de tríceps', 'Tríceps', 'Extensión de tríceps con mancuerna inclinado', true),
('Press cerrado', 'Tríceps', 'Press de banca agarre cerrado', true),
('Extensión sobre la cabeza', 'Tríceps', 'Extensión de tríceps con mancuerna sobre la cabeza', true),

-- Piernas
('Sentadilla', 'Piernas', 'Sentadilla libre con barra', true),
('Sentadilla goblet', 'Piernas', 'Sentadilla con mancuerna o kettlebell', true),
('Prensa de piernas', 'Piernas', 'Prensa en máquina', true),
('Zancadas', 'Piernas', 'Zancadas con mancuernas', true),
('Extensión de cuádriceps', 'Piernas', 'Extensión en máquina', true),
('Curl femoral tumbado', 'Piernas', 'Curl de isquiotibiales en máquina', true),
('Curl femoral de pie', 'Piernas', 'Curl de isquiotibiales de pie en máquina', true),
('Peso muerto convencional', 'Piernas', 'Peso muerto con barra', true),
('Hack squat', 'Piernas', 'Sentadilla en máquina hack', true),
('Step up', 'Piernas', 'Subidas al cajón con mancuernas', true),

-- Glúteos
('Hip thrust', 'Glúteos', 'Empuje de cadera con barra', true),
('Patada trasera en polea', 'Glúteos', 'Extensión de cadera en cable', true),
('Sentadilla sumo', 'Glúteos', 'Sentadilla con apertura de piernas', true),
('Abducción en máquina', 'Glúteos', 'Separación de piernas en máquina', true),
('Glute bridge', 'Glúteos', 'Puente de glúteos en suelo', true),

-- Abdomen
('Crunch abdominal', 'Abdomen', 'Encogimiento abdominal en suelo', true),
('Plancha', 'Abdomen', 'Plancha isométrica frontal', true),
('Elevación de piernas', 'Abdomen', 'Elevación de piernas colgado', true),
('Rueda abdominal', 'Abdomen', 'Ab wheel rollout', true),
('Crunches en polea', 'Abdomen', 'Crunch con cable en polea alta', true),
('Russian twist', 'Abdomen', 'Rotación de torso con peso', true),

-- Cardio
('Cinta de correr', 'Cardio', 'Carrera en cinta', true),
('Bicicleta estática', 'Cardio', 'Bicicleta de baja/alta intensidad', true),
('Elíptica', 'Cardio', 'Ejercicio en máquina elíptica', true),
('Remo ergómetro', 'Cardio', 'Remo en máquina', true),
('Salto a la cuerda', 'Cardio', 'Jump rope', true),
('HIIT en cinta', 'Cardio', 'Intervalos de alta intensidad en cinta', true)
ON CONFLICT DO NOTHING;
