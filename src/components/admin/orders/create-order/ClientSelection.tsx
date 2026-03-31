import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Search, Plus, Loader2, X } from "lucide-react";
import { CreateClientModal } from "@/components/admin/clients/CreateClientModal";

interface ClientSelectionProps {
    onClientSelect: (client: any) => void;
    selectedClient: { name: string; email: string; company: string; id: string } | null;
    onReset: () => void;
}

export function ClientSelection({ onClientSelect, selectedClient, onReset }: ClientSelectionProps) {
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchClients();
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchClients = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('clients')
            .select('id, first_name, last_name, email, phone, company_name')
            .order('last_name');
        if (data) setClients(data);
        setIsLoading(false);
    };

    const filteredClients = clients.filter(client => {
        const searchLower = searchTerm.toLowerCase();
        return `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase().includes(searchLower) ||
            (client.email || '').toLowerCase().includes(searchLower) ||
            (client.company_name || '').toLowerCase().includes(searchLower);
    });

    return (
        <div className="bg-[#ed5518] p-4 rounded-lg border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-white font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Sélectionner un client
                </Label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-gray-100 h-8"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Nouveau client
                </Button>
            </div>

            <div className="relative" ref={dropdownRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Rechercher un client..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                        onFocus={() => setShowDropdown(true)}
                        className="pl-10 bg-white"
                    />
                </div>

                {showDropdown && !selectedClient?.id && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-3 text-center text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            </div>
                        ) : (
                            filteredClients.map(client => (
                                <div
                                    key={client.id}
                                    onClick={() => {
                                        onClientSelect(client);
                                        setSearchTerm(`${client.first_name || ''} ${client.last_name || ''}`.trim());
                                        setShowDropdown(false);
                                    }}
                                    className="p-3 hover:bg-[#ed5518] hover:text-white cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="font-medium">{client.first_name} {client.last_name}</div>
                                    <div className="text-xs opacity-70">{client.company_name}</div>
                                    <div className="text-xs opacity-60">{client.email}</div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {selectedClient?.id && (
                <div className="bg-white p-3 rounded border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-gray-900">{selectedClient.name}</div>
                            <div className="text-xs text-gray-600">{selectedClient.company}</div>
                            <div className="text-xs text-gray-500">{selectedClient.email}</div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { onReset(); setSearchTerm(""); }}
                            className="text-red-500 hover:text-red-700 h-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            <CreateClientModal 
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={(newClient) => {
                    fetchClients();
                    onClientSelect(newClient);
                    setShowCreateModal(false);
                }}
            />
        </div>
    );
}
