-- Insert Blog navigation item
-- First, check if blog navigation already exists
DO $$
DECLARE
    blog_nav_id INTEGER;
BEGIN
    -- Check if blog navigation item already exists
    SELECT id INTO blog_nav_id FROM header_nav_items WHERE route = '/blog';
    
    -- If it doesn't exist, insert it
    IF blog_nav_id IS NULL THEN
        INSERT INTO header_nav_items (name, route, is_active, sort_order)
        VALUES ('Blog', '/blog', TRUE, 85)
        RETURNING id INTO blog_nav_id;
    ELSE
        -- If it exists, update it
        UPDATE header_nav_items
        SET name = 'Blog',
            is_active = TRUE,
            sort_order = 85
        WHERE id = blog_nav_id;
    END IF;
    
    -- Delete existing translations for this nav item
    DELETE FROM header_nav_items_translations WHERE nav_item_id = blog_nav_id;
    
    -- Insert fresh translations for the Blog navigation item
    INSERT INTO header_nav_items_translations (nav_item_id, language_code, name) VALUES
    (blog_nav_id, 'fr', 'Blog'),
    (blog_nav_id, 'es', 'Blog');
END $$;