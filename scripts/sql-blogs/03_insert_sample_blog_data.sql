-- Insert sample blog categories
INSERT INTO blog_categories (slug, name, description, icon, color, is_active, sort_order) VALUES
('medical-equipment', 'Medical Equipment', 'Articles about medical equipment and technology', 'fa-stethoscope', '#3B9FD9', TRUE, 1),
('healthcare-tips', 'Healthcare Tips', 'Health and wellness advice for professionals', 'fa-heartbeat', '#2E7D32', TRUE, 2),
('industry-news', 'Industry News', 'Latest updates from the medical equipment industry', 'fa-newspaper', '#FF6B6B', TRUE, 3),
('product-guides', 'Product Guides', 'Detailed guides and tutorials for medical equipment', 'fa-book', '#4ECDC4', TRUE, 4),
('case-studies', 'Case Studies', 'Real-world applications and success stories', 'fa-chart-line', '#FFE66D', TRUE, 5);

-- Insert blog category translations - French
INSERT INTO blog_categories_translations (category_id, language_code, name, description) VALUES
(1, 'fr', 'Équipement Médical', 'Articles sur l''équipement médical et la technologie'),
(2, 'fr', 'Conseils de Santé', 'Conseils de santé et de bien-être pour les professionnels'),
(3, 'fr', 'Actualités de l''Industrie', 'Dernières mises à jour de l''industrie de l''équipement médical'),
(4, 'fr', 'Guides de Produits', 'Guides détaillés et tutoriels pour l''équipement médical'),
(5, 'fr', 'Études de Cas', 'Applications réelles et histoires de réussite');

-- Insert blog category translations - Spanish
INSERT INTO blog_categories_translations (category_id, language_code, name, description) VALUES
(1, 'es', 'Equipo Médico', 'Artículos sobre equipos médicos y tecnología'),
(2, 'es', 'Consejos de Salud', 'Consejos de salud y bienestar para profesionales'),
(3, 'es', 'Noticias de la Industria', 'Últimas actualizaciones de la industria de equipos médicos'),
(4, 'es', 'Guías de Productos', 'Guías detalladas y tutoriales para equipos médicos'),
(5, 'es', 'Estudios de Caso', 'Aplicaciones del mundo real e historias de éxito');

-- Insert sample blog tags
INSERT INTO blog_tags (slug, name, is_active, sort_order) VALUES
('ventilators', 'Ventilators', TRUE, 1),
('patient-monitoring', 'Patient Monitoring', TRUE, 2),
('maintenance', 'Maintenance', TRUE, 3),
('technology', 'Technology', TRUE, 4),
('innovation', 'Innovation', TRUE, 5),
('safety', 'Safety', TRUE, 6),
('training', 'Training', TRUE, 7),
('covid-19', 'COVID-19', TRUE, 8);

-- Insert blog tag translations - French
INSERT INTO blog_tags_translations (tag_id, language_code, name) VALUES
(1, 'fr', 'Ventilateurs'),
(2, 'fr', 'Surveillance des Patients'),
(3, 'fr', 'Maintenance'),
(4, 'fr', 'Technologie'),
(5, 'fr', 'Innovation'),
(6, 'fr', 'Sécurité'),
(7, 'fr', 'Formation'),
(8, 'fr', 'COVID-19');

-- Insert blog tag translations - Spanish
INSERT INTO blog_tags_translations (tag_id, language_code, name) VALUES
(1, 'es', 'Ventiladores'),
(2, 'es', 'Monitoreo de Pacientes'),
(3, 'es', 'Mantenimiento'),
(4, 'es', 'Tecnología'),
(5, 'es', 'Innovación'),
(6, 'es', 'Seguridad'),
(7, 'es', 'Capacitación'),
(8, 'es', 'COVID-19');