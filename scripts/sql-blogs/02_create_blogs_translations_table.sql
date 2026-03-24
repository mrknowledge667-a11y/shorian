-- Create translations table for blogs
CREATE TABLE IF NOT EXISTS blogs_translations (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blog_id, language_code)
);

-- Create translations table for blog categories
CREATE TABLE IF NOT EXISTS blog_categories_translations (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, language_code)
);

-- Create translations table for blog tags
CREATE TABLE IF NOT EXISTS blog_tags_translations (
    id SERIAL PRIMARY KEY,
    tag_id INTEGER NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tag_id, language_code)
);

-- Add foreign key constraints to ensure language_code exists
ALTER TABLE blogs_translations
ADD CONSTRAINT fk_blogs_translations_language
FOREIGN KEY (language_code)
REFERENCES languages(code)
ON DELETE CASCADE;

ALTER TABLE blog_categories_translations
ADD CONSTRAINT fk_blog_categories_translations_language
FOREIGN KEY (language_code)
REFERENCES languages(code)
ON DELETE CASCADE;

ALTER TABLE blog_tags_translations
ADD CONSTRAINT fk_blog_tags_translations_language
FOREIGN KEY (language_code)
REFERENCES languages(code)
ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_blogs_translations_blog ON blogs_translations(blog_id);
CREATE INDEX idx_blogs_translations_language ON blogs_translations(language_code);
CREATE INDEX idx_blog_categories_translations_category ON blog_categories_translations(category_id);
CREATE INDEX idx_blog_categories_translations_language ON blog_categories_translations(language_code);
CREATE INDEX idx_blog_tags_translations_tag ON blog_tags_translations(tag_id);
CREATE INDEX idx_blog_tags_translations_language ON blog_tags_translations(language_code);

-- Create triggers for updated_at
CREATE TRIGGER update_blogs_translations_updated_at BEFORE UPDATE ON blogs_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_translations_updated_at BEFORE UPDATE ON blog_categories_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_tags_translations_updated_at BEFORE UPDATE ON blog_tags_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();