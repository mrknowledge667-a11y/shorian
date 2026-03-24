-- Fix the broken image for the sterilization blog post
-- Update with a new working medical sterilization/surgical equipment image

UPDATE blogs 
SET 
    featured_image = 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    og_image = 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
WHERE slug = 'sterilization-best-practices-medical-equipment';

-- Alternative high-quality medical sterilization images if the above doesn't work:
-- Option 1: Surgical instruments being sterilized
-- https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80

-- Option 2: Clean medical equipment
-- https://images.unsplash.com/photo-1583947215259-38e31be8751f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80

-- Option 3: Medical sterilization equipment/autoclave
-- https://images.unsplash.com/photo-1631815588090-e4a15c0e2e85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80