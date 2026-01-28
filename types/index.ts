export type order_status =
    | 'PENDING'
    | 'DIAGNOSIS'
    | 'QUOTED'
    | 'APPROVED'
    | 'IN_PROGRESS'
    | 'WAITING_PARTS'
    | 'COMPLETED'
    | 'READY'
    | 'DELIVERED'
    | 'CANCELLED';

export interface Client {
    id: string;
    national_id: string;
    full_name: string;
    phone: string;
    email?: string;
    address: string;
    latitude?: number;
    longitude?: number;
    category: 'REGULAR' | 'PREMIUM' | 'ENTERPRISE';
    created_at: string;
}

export interface Equipment {
    id: string;
    client_id: string;
    type: string;
    brand: string;
    model: string;
    serial_number: string;
    purchase_date?: string;
    specs: Record<string, any>;
    created_at: string;
}

export interface ServiceOrder {
    id: string;
    order_number: string;
    client_id: string;
    equipment_id: string;
    technician_id?: string;
    status: order_status;
    reported_issue: string;
    technical_diagnosis?: string;
    labor_cost: number;
    total_cost: number;
    is_warranty: boolean;
    scheduled_at?: string;
    completed_at?: string;
    created_at: string;
}

export interface NavItem {
    id: string;
    icon: string;
    label: string;
    path: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
}

export interface ServiceItem {
    id: string;
    clientName: string;
    appliance: string;
    issue: string;
    time: string;
    address?: string;
    status: 'pending' | 'active' | 'completed' | 'new';
    statusLabel?: string;
    statusColor?: string;
    isWarranty?: boolean;
    technician?: string;
}
