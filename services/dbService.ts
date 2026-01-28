// Mock Database Service using LocalStorage

export interface Client {
  id: string; // Internal UUID
  nationalId: string; // Cédula, DNI, INE (Unique Person ID)
  name: string;
  phone: string;
  address: string;
  email?: string;
  initials: string;
  color: string;
  group?: 'Frecuente' | 'Empresa' | 'Nuevo' | 'Moroso';
  createdAt: string;
}

export interface Equipment {
  id: string;
  clientId: string;
  type: string;
  brand: string;
  model: string;
  serial: string;
  purchaseDate?: string;
  createdAt: string;
}

export interface ServiceOrder {
  id: string; // Order ID (e.g., ORD-2024-001)
  clientId: string;
  equipmentId?: string;
  clientName: string; // Denormalized for easier display
  clientAddress: string;
  nationalId: string; // Reference to person ID
  appliance: string;
  issue: string;
  technicalDiagnosis?: string;
  date: string;
  time: string;
  technicianId?: string;
  technicianName?: string;
  status: 'pending' | 'active' | 'completed' | 'new';
  photos: string[];
  cost?: number;
  isWarranty: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string; // e.g. "Bancolombia", "Nequi", "Efectivo"
  details: string; // e.g. "Cuenta Ahorros ****1234"
  active: boolean;
  icon: string;
}

export interface BusinessProfile {
  name: string;
  taxId: string; // NIT / RFC
  address: string;
  phone: string;
  email: string;
  website?: string;
  paymentMethods: PaymentMethod[];
}

// Initial Seed Data
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    nationalId: '1098765432',
    name: 'Juan Pérez',
    phone: '3001234567',
    address: 'Av. Reforma 123',
    initials: 'JP',
    color: 'bg-blue-600',
    group: 'Frecuente',
    createdAt: new Date().toISOString()
  },
  {
    id: 'c2',
    nationalId: '8877665544',
    name: 'Maria Rodriguez',
    phone: '3109876543',
    address: 'Calle 10 #45-12',
    initials: 'MR',
    color: 'bg-purple-600',
    group: 'Nuevo',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_SERVICES: ServiceOrder[] = [
  {
    id: 'ORD-9980-001',
    clientId: 'c1',
    nationalId: '1098765432',
    clientName: 'Juan Pérez',
    clientAddress: 'Av. Reforma 123',
    appliance: 'Refrigerador Samsung',
    issue: 'No enfría parte baja',
    date: '2025-03-20',
    time: '09:00',
    technicianId: '1',
    technicianName: 'Carlos Ruiz',
    status: 'active',
    photos: [],
    isWarranty: false
  }
];

const INITIAL_BUSINESS_PROFILE: BusinessProfile = {
  name: "ServiTech Pro",
  taxId: "900.123.456-7",
  address: "Calle 100 #15-20, Oficina 302",
  phone: "300 999 8888",
  email: "contacto@servitechpro.com",
  paymentMethods: [
    { id: 'pm1', name: 'Efectivo', details: 'Pago directo', active: true, icon: 'payments' },
    { id: 'pm2', name: 'Bancolombia', details: 'Ahorros 032-123456-99', active: true, icon: 'account_balance' },
    { id: 'pm3', name: 'Nequi', details: '300 999 8888', active: true, icon: 'smartphone' }
  ]
};

class DBService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem('db_clients')) {
      localStorage.setItem('db_clients', JSON.stringify(INITIAL_CLIENTS));
    }
    if (!localStorage.getItem('db_services')) {
      localStorage.setItem('db_services', JSON.stringify(INITIAL_SERVICES));
    }
    if (!localStorage.getItem('db_business_profile')) {
      localStorage.setItem('db_business_profile', JSON.stringify(INITIAL_BUSINESS_PROFILE));
    }
  }

  getClients(): Client[] {
    const data = localStorage.getItem('db_clients');
    return data ? JSON.parse(data) : [];
  }

  addClient(client: Omit<Client, 'id' | 'initials' | 'color' | 'createdAt'>): Client {
    const clients = this.getClients();
    if (clients.some(c => c.nationalId === client.nationalId)) {
      throw new Error(`El cliente con ID ${client.nationalId} ya existe.`);
    }
    const initials = client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-500', 'bg-rose-500'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      initials,
      color,
      createdAt: new Date().toISOString()
    };
    clients.push(newClient);
    localStorage.setItem('db_clients', JSON.stringify(clients));
    return newClient;
  }

  updateClient(client: Client): void {
    const clients = this.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...client };
      localStorage.setItem('db_clients', JSON.stringify(clients));
    }
  }

  getClientByNationalId(nid: string): Client | undefined {
    return this.getClients().find(c => c.nationalId === nid);
  }

  getServices(): ServiceOrder[] {
    const data = localStorage.getItem('db_services');
    return data ? JSON.parse(data) : [];
  }

  addService(service: Omit<ServiceOrder, 'id'>): ServiceOrder {
    const services = this.getServices();
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const id = `ORD-${timestamp}-${random}`;
    const newService: ServiceOrder = { ...service, id };
    services.unshift(newService);
    localStorage.setItem('db_services', JSON.stringify(services));
    return newService;
  }

  updateServiceStatus(serviceId: string, status: ServiceOrder['status']): void {
    const services = this.getServices();
    const index = services.findIndex(s => s.id === serviceId);
    if (index !== -1) {
      services[index].status = status;
      localStorage.setItem('db_services', JSON.stringify(services));
    }
  }

  getBusinessProfile(): BusinessProfile {
    const data = localStorage.getItem('db_business_profile');
    return data ? JSON.parse(data) : INITIAL_BUSINESS_PROFILE;
  }

  updateBusinessProfile(profile: BusinessProfile): void {
    localStorage.setItem('db_business_profile', JSON.stringify(profile));
  }
}

export const db = new DBService();