-- ENUMS
CREATE TYPE order_status AS ENUM (
    'PENDING', 'DIAGNOSIS', 'QUOTED', 'APPROVED', 
    'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 
    'READY', 'DELIVERED', 'CANCELLED'
);

CREATE TYPE client_category AS ENUM ('REGULAR', 'PREMIUM', 'ENTERPRISE');

-- TABLES
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    national_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    category client_category NOT NULL DEFAULT 'REGULAR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE technicians (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    specialty TEXT,
    phone TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    serial_number TEXT UNIQUE NOT NULL,
    purchase_date DATE,
    specs JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    stock_level INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL, -- Format: ORD-YYYY-XXXX
    client_id UUID NOT NULL REFERENCES clients(id),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    technician_id UUID REFERENCES technicians(id),
    status order_status NOT NULL DEFAULT 'PENDING',
    reported_issue TEXT NOT NULL,
    technical_diagnosis TEXT,
    labor_cost DECIMAL(12,2) DEFAULT 0,
    total_cost DECIMAL(12,2) DEFAULT 0,
    is_warranty BOOLEAN DEFAULT false,
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES parts(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time DECIMAL(12,2) NOT NULL
);

CREATE TABLE status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    status_from order_status NOT NULL,
    status_to order_status NOT NULL,
    comment TEXT,
    changed_by_id UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Service Orders Policies
-- Technicians can see orders assigned to them or unassigned
CREATE POLICY "Technicians can view assigned or unassigned orders" 
ON service_orders FOR SELECT 
TO authenticated
USING (
    technician_id = auth.uid() OR technician_id IS NULL
);

-- For other tables, we might want technicians to see all for now to operate
CREATE POLICY "Technicians can view all clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Technicians can view all equipment" ON equipment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Technicians can view all parts" ON parts FOR SELECT TO authenticated USING (true);

-- Functions & Triggers
-- Function to automatically update status history could be added here
