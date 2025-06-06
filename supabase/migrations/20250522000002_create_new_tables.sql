-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    bullet_points TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    icon_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Social Contacts table
CREATE TABLE IF NOT EXISTS social_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('social', 'email', 'phone')) NOT NULL,
    
    -- This platform constraint now only applies for 'social' type
    platform TEXT,
    
    handle_or_url TEXT,   -- for social media usernames/links
    value TEXT,           -- for email or phone
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: If phone, must be +91 followed by exactly 10 digits
    CONSTRAINT phone_format CHECK (
        type != 'phone' OR value ~ '^\+91[0-9]{10}$'
    ),
    
    -- Constraint: Only allow platform if type = 'social'
    CONSTRAINT platform_social_only CHECK (
        type != 'social' OR platform IN ('LinkedIn', 'X', 'Facebook', 'YouTube', 'Instagram')
    ),
    
    -- Prevent platform from being used for non-social types
    CONSTRAINT platform_null_for_non_social CHECK (
        type = 'social' OR platform IS NULL
    )
);

-- Create Mission & Vision table
CREATE TABLE IF NOT EXISTS mission_vision (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('mission', 'vision')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security for all tables
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_vision ENABLE ROW LEVEL SECURITY;

-- Create policies for FAQs
CREATE POLICY "Enable read access for all users" ON faqs
    FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON faqs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON faqs
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON faqs
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for Services
CREATE POLICY "Enable read access for all users" ON services
    FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON services
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON services
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON services
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for Social Contacts
CREATE POLICY "Enable read access for all users" ON social_contacts
    FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON social_contacts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON social_contacts
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON social_contacts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for Mission & Vision
CREATE POLICY "Enable read access for all users" ON mission_vision
    FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON mission_vision
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON mission_vision
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON mission_vision
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_contacts_updated_at
    BEFORE UPDATE ON social_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mission_vision_updated_at
    BEFORE UPDATE ON mission_vision
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 