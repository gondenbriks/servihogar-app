
import { supabase } from './supabaseClient';
import { Client, Equipment, ServiceOrder, BusinessProfile } from './dbService';

export class SupabaseService {
    // Clients
    async getClients(): Promise<Client[]> {
        const { data, error } = await supabase
            .from('clients')
            .select('*, service_orders(scheduled_at, equipments(type))');

        if (error) throw error;

        return (data || []).map(c => {
            // Find the latest service date and appliance
            const services = c.service_orders || [];
            const sorted = services.sort((a: any, b: any) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
            const lastService = sorted.length > 0 ? sorted[0] : null;

            return {
                id: c.id,
                nationalId: c.national_id,
                name: c.full_name,
                phone: c.phone,
                address: c.address,
                email: c.email,
                initials: c.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
                color: 'bg-blue-600',
                group: c.category as any,
                lastServiceDate: lastService?.scheduled_at,
                lastAppliance: lastService?.equipments?.type,
                createdAt: c.created_at
            };
        });
    }



    async addClient(client: Omit<Client, 'id' | 'initials' | 'color' | 'createdAt'>): Promise<Client> {
        const { data, error } = await supabase
            .from('clients')
            .insert({
                national_id: client.nationalId,
                full_name: client.name,
                phone: client.phone,
                address: client.address,
                email: client.email,
                category: (client.group?.toUpperCase() as any) || 'REGULAR'
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            nationalId: data.national_id,
            name: data.full_name,
            phone: data.phone,
            address: data.address,
            email: data.email,
            initials: data.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
            color: 'bg-blue-600',
            group: data.category,
            createdAt: data.created_at
        };
    }

    async getClientByNationalId(nid: string): Promise<Client | undefined> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('national_id', nid)
            .maybeSingle();

        if (error) throw error;
        if (!data) return undefined;

        return {
            id: data.id,
            nationalId: data.national_id,
            name: data.full_name,
            phone: data.phone,
            address: data.address,
            email: data.email,
            initials: data.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
            color: 'bg-blue-600',
            group: data.category,
            createdAt: data.created_at
        };
    }

    async updateClient(client: Partial<Client> & { id: string }): Promise<void> {
        const updateData: any = {};
        if (client.nationalId) updateData.national_id = client.nationalId;
        if (client.name) updateData.full_name = client.name;
        if (client.phone) updateData.phone = client.phone;
        if (client.address) updateData.address = client.address;
        if (client.email) updateData.email = client.email;
        if (client.group) updateData.category = client.group.toUpperCase();

        const { error } = await supabase
            .from('clients')
            .update(updateData)
            .eq('id', client.id);

        if (error) throw error;
    }

    // Equipment
    async addEquipment(equipment: Omit<Equipment, 'id' | 'createdAt'>): Promise<Equipment> {
        const { data, error } = await supabase
            .from('equipments')
            .insert({
                client_id: equipment.clientId,
                type: equipment.type,
                brand: equipment.brand,
                model: equipment.model,
                serial_number: equipment.serial
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            clientId: data.client_id,
            type: data.type,
            brand: data.brand,
            model: data.model,
            serial: data.serial_number,
            purchaseDate: data.created_at,
            createdAt: data.created_at
        };
    }

    async getEquipmentByClient(clientId: string): Promise<Equipment[]> {
        const { data, error } = await supabase
            .from('equipments')
            .select('*')
            .eq('client_id', clientId);

        if (error) throw error;

        return (data || []).map(e => ({
            id: e.id,
            clientId: e.client_id,
            type: e.type,
            brand: e.brand,
            model: e.model,
            serial: e.serial_number,
            purchaseDate: e.created_at, // Use created_at if no purchase date in schema
            createdAt: e.created_at
        }));
    }

    // Service Orders
    async getServices(): Promise<ServiceOrder[]> {
        const { data, error } = await supabase
            .from('service_orders')
            .select('*, clients(*), equipments(*)');

        if (error) throw error;

        return (data || []).map(s => ({
            id: s.id,
            clientId: s.client_id,
            equipmentId: s.equipment_id,
            clientName: s.clients?.full_name || 'N/A',
            clientAddress: s.clients?.address || 'N/A',
            nationalId: s.clients?.national_id || '',
            appliance: `${s.equipments?.type} ${s.equipments?.brand}` || 'N/A',
            issue: s.reported_issue,
            technicalDiagnosis: s.technical_diagnosis,
            date: s.scheduled_at || s.created_at,
            time: '00:00', // Time needs adjustment
            technicianId: s.technician_id,
            status: s.status.toLowerCase() as any,
            photos: [],
            cost: s.total_cost,
            isWarranty: s.is_warranty
        }));
    }

    async addService(service: Omit<ServiceOrder, 'id'>): Promise<ServiceOrder> {
        const { data, error } = await supabase
            .from('service_orders')
            .insert({
                client_id: service.clientId,
                equipment_id: service.equipmentId,
                technician_id: service.technicianId,
                status: (service.status.toUpperCase() as any) || 'PENDING',
                reported_issue: service.issue,
                scheduled_at: service.date + 'T' + service.time + ':00Z', // Rough ISO conversion
                is_warranty: service.isWarranty,
                total_cost: service.cost || 0
            })
            .select('*, clients(*), equipments(*)')
            .single();

        if (error) throw error;

        return {
            id: data.id,
            clientId: data.client_id,
            equipmentId: data.equipment_id,
            clientName: data.clients?.full_name || 'N/A',
            clientAddress: data.clients?.address || 'N/A',
            nationalId: data.clients?.national_id || '',
            appliance: `${data.equipments?.type} ${data.equipments?.brand}` || 'N/A',
            issue: data.reported_issue,
            technicalDiagnosis: data.technical_diagnosis,
            date: data.scheduled_at || data.created_at,
            time: '00:00',
            technicianId: data.technician_id,
            status: data.status.toLowerCase() as any,
            photos: [],
            cost: data.total_cost,
            isWarranty: data.is_warranty
        };
    }

    async updateService(id: string, updates: Partial<ServiceOrder>): Promise<void> {
        const updateData: any = {};
        if (updates.status) updateData.status = updates.status.toUpperCase();
        if (updates.technicalDiagnosis) updateData.technical_diagnosis = updates.technicalDiagnosis;
        if (updates.cost !== undefined) updateData.total_cost = updates.cost;

        const { error } = await supabase
            .from('service_orders')
            .update(updateData)
            .eq('id', id);

        if (error) throw error;
    }
}

export const supabaseDb = new SupabaseService();
