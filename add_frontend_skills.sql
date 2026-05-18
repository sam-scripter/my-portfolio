-- Add Frontend category skills
-- Proficiency scale: 5=Expert, 4=Proficient, 3=Working knowledge, 2=Foundational
-- React & Node.js are set to 3 (Working knowledge) since Flutter/Dart is primary

INSERT INTO skills (name, category, proficiency, display_order) VALUES
  ('React.js',    'Frontend', 3, 1),
  ('Next.js',     'Frontend', 3, 2),
  ('Node.js',     'Frontend', 3, 3),
  ('TypeScript',  'Frontend', 3, 4),
  ('Tailwind CSS','Frontend', 3, 5),
  ('HTML / CSS',  'Frontend', 4, 6)
ON CONFLICT DO NOTHING;
