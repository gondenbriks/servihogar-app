export type OrderStatus =
    | 'PENDING'       // Recibida, sin asignar
    | 'DIAGNOSIS'     // Técnico evaluando
    | 'QUOTED'        // Presupuesto enviado al cliente
    | 'APPROVED'      // Cliente aceptó el arreglo
    | 'IN_PROGRESS'   // En reparación
    | 'WAITING_PARTS' // Esperando repuestos del proveedor
    | 'COMPLETED'     // Trabajo técnico terminado
    | 'READY'         // Listo para entrega/cobro
    | 'DELIVERED'     // Entregado y cerrado
    | 'CANCELLED';    // Cancelada

export interface Client {
    id: string;
    nationalId: string; // DNI, NIT, etc.
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    latitude?: number;
    longitude?: number;
    category: 'REGULAR' | 'PREMIUM' | 'ENTERPRISE';
    createdAt: string;
}

export interface Equipment {
    id: string;
    clientId: string;
    type: string; // Ex: Lavadora, Secadora
    brand: string;
    model: string;
    serialNumber: string;
    purchaseDate?: string;
    specs: Record<string, any>; // Flexible for different appliance attributes
    createdAt: string;
}

export interface Technician {
    id: string;
    fullName: string;
    specialty: string;
    phone: string;
    commissionRate: number;
    isActive: boolean;
}

export interface Part {
    id: string;
    code: string;
    name: string;
    description?: string;
    stockLevel: number;
    minStock: number;
    unitCost: number;
    unitPrice: number;
}

export interface OrderItem {
    id: string;
    orderId: string;
    partId: string;
    quantity: number;
    priceAtTime: number;
}

export interface ServiceOrder {
    id: string;
    orderNumber: string; // Human readable: ORD-2024-001
    clientId: string;
    equipmentId: string;
    technicianId?: string;
    status: OrderStatus;
    reportedIssue: string;
    technicalDiagnosis?: string;
    laborCost: number;
    totalCost: number;
    isWarranty: boolean;
    scheduledAt?: string;
    completedAt?: string;
    createdAt: string;
}

export interface StatusHistory {
    id: string;
    orderId: string;
    statusFrom: OrderStatus;
    statusTo: OrderStatus;
    comment?: string;
    changedById: string; // ID of the user/admin who changed it
    changedAt: string;
}
