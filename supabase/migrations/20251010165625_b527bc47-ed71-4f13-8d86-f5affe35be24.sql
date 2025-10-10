-- Seed data for home_content table
INSERT INTO public.home_content (section_type, title, description, button_text, button_link, image_url, order_index, status) VALUES
('hero', 'Experience Automotive Excellence', 'Discover the world''s finest collection of luxury, sports, and electric vehicles', 'View Collection', '/cars', NULL, 1, 'active'),
('hero_cta', NULL, NULL, 'Explore Auctions', '/auction', NULL, 2, 'active'),
('about', 'Welcome to Elite Motors', 'For over two decades, Elite Motors has been the premier destination for automotive excellence. We curate the world''s finest vehicles, offering unparalleled service and expertise to discerning clients.', 'Learn More', '/about', NULL, 3, 'active'),
('stat', '20+', 'Years Experience', NULL, NULL, NULL, 4, 'active'),
('stat', '5000+', 'Cars Sold', NULL, NULL, NULL, 5, 'active'),
('stat', '98%', 'Satisfaction Rate', NULL, NULL, NULL, 6, 'active'),
('stat', '24/7', 'Support', NULL, NULL, NULL, 7, 'active'),
('featured_section', 'Featured Collection', 'Handpicked selection of our most exceptional vehicles', NULL, NULL, NULL, 8, 'active'),
('category_section', 'Explore by Category', 'Find the perfect vehicle for your lifestyle', NULL, NULL, NULL, 9, 'active'),
('why_choose', 'Why Choose Elite Motors', NULL, NULL, NULL, NULL, 10, 'active'),
('why_item', 'Premium Selection', 'Curated collection of the world''s finest vehicles, rigorously inspected for excellence', NULL, NULL, NULL, 11, 'active'),
('why_item', 'Trusted Service', '20+ years of excellence with transparent pricing and comprehensive warranties', NULL, NULL, NULL, 12, 'active'),
('why_item', '24/7 Support', 'Expert assistance available around the clock for all your automotive needs', NULL, NULL, NULL, 13, 'active'),
('testimonial_section', 'What Our Clients Say', NULL, NULL, NULL, NULL, 14, 'active'),
('cta', 'Ready to Find Your Dream Car?', 'Start your journey with Elite Motors today', 'Browse Collection', '/cars', NULL, 15, 'active'),
('cta_secondary', NULL, NULL, 'Contact Us', '/contact', NULL, 16, 'active');

-- Seed data for about_content table  
INSERT INTO public.about_content (section_type, content, status) VALUES
('hero', '{"title": "About Elite Motors", "description": "Two decades of excellence in luxury automotive sales and service"}'::jsonb, 'active'),
('story', '{"title": "Our Story", "paragraphs": ["Founded in 2004, Elite Motors began with a simple vision: to redefine the luxury car buying experience. What started as a small showroom with a handful of premium vehicles has evolved into one of the most prestigious automotive destinations in the region.", "Our founder, Alexander Morgan, recognized that purchasing a luxury vehicle should be as exceptional as the cars themselves. This philosophy drives everything we do, from our carefully curated inventory to our white-glove customer service.", "Today, Elite Motors represents the pinnacle of automotive excellence, offering an unparalleled selection of luxury, sports, and electric vehicles from the world''s most prestigious manufacturers. Our commitment to quality, transparency, and customer satisfaction has earned us the trust of thousands of discerning clients."]}'::jsonb, 'active'),
('stats', '{"stats": [{"label": "Years in Business", "value": "20+", "icon": "Award"}, {"label": "Cars Sold", "value": "5,000+", "icon": "TrendingUp"}, {"label": "Happy Clients", "value": "4,500+", "icon": "Users"}, {"label": "Satisfaction Rate", "value": "98%", "icon": "Shield"}]}'::jsonb, 'active'),
('mission', '{"title": "Our Mission", "text": "To provide an unparalleled automotive experience by offering the world''s finest vehicles, backed by exceptional service, transparent practices, and unwavering commitment to customer satisfaction. We strive to make every client interaction memorable and every vehicle purchase a celebration."}'::jsonb, 'active'),
('vision', '{"title": "Our Vision", "text": "To be recognized as the premier destination for luxury automotive excellence, setting industry standards for quality, innovation, and customer care. We envision a future where Elite Motors is synonymous with trust, prestige, and the ultimate automotive experience."}'::jsonb, 'active'),
('team', '{"title": "Meet Our Team", "description": "Passionate professionals dedicated to delivering excellence", "members": [{"name": "Alexander Morgan", "role": "Chief Executive Officer", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"}, {"name": "Sophia Martinez", "role": "Head of Sales", "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"}, {"name": "James Chen", "role": "Director of Operations", "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"}, {"name": "Emily Rodriguez", "role": "Customer Success Manager", "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop"}]}'::jsonb, 'active'),
('cta', '{"title": "Ready to Experience Excellence?", "description": "Visit our showroom or contact us to begin your journey", "buttons": [{"text": "View Collection", "link": "/cars"}, {"text": "Contact Us", "link": "/contact"}]}'::jsonb, 'active');

-- Seed data for auctions table
INSERT INTO public.auctions (car_name, current_bid, image_url, end_time, total_bids, description, status) VALUES
('Ferrari 488 Spider', 275000, '/src/assets/luxury-car.jpg', NOW() + INTERVAL '2 days', 24, 'Pure Italian performance and passion in a stunning convertible package', 'active'),
('Lamborghini Aventador', 385000, '/src/assets/sports-car.jpg', NOW() + INTERVAL '1 day', 31, 'The ultimate supercar experience with breathtaking performance', 'active'),
('BMW X7 M50i', 125000, '/src/assets/suv-car.jpg', NOW() + INTERVAL '3 days', 18, 'Luxury SUV combining elegance with powerful performance', 'active');

-- Seed data for contact_info table
INSERT INTO public.contact_info (address, phone_numbers, email_addresses, working_hours, map_embed_url, status) VALUES
('123 Luxury Avenue, Premium District, NY 10001, United States',
'["Sales: +1 (555) 123-4567", "Service: +1 (555) 123-4568"]'::jsonb,
'["info@elitemotors.com", "sales@elitemotors.com"]'::jsonb,
'Monday - Friday: 9:00 AM - 7:00 PM, Saturday: 10:00 AM - 6:00 PM, Sunday: 11:00 AM - 5:00 PM',
'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9476519598093!2d-73.99185368459395!3d40.74844097932847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890123',
'active');