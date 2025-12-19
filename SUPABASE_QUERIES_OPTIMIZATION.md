# Optimisation des Requêtes Supabase - Guide d'Utilisation

## Résumé des Modifications

Les fonctions `getUserOrders` et `getInvoicesByUser` ont été optimisées pour :

1. **Pagination** : Accepter des paramètres `page` et `limit`
2. **Sélection explicite** : Récupérer uniquement les champs nécessaires à l'affichage
3. **Count total** : Retourner le nombre total d'éléments pour la pagination côté front

## Nouveaux Types

### `PaginatedResult<T>`
```typescript
interface PaginatedResult<T> {
    data: T[];           // Les données de la page actuelle
    count: number;       // Nombre total d'éléments
    page: number;        // Numéro de la page actuelle
    limit: number;       // Nombre d'éléments par page
    totalPages: number;  // Nombre total de pages
}
```

### `OrderSummary`
Type allégé pour les commandes paginées contenant uniquement les champs essentiels :
- `id`, `status`, `total_amount`, `created_at`
- `pickup_address`, `delivery_address`
- `pickup_lat`, `pickup_lng`, `delivery_lat`, `delivery_lng`
- `estimated_delivery`, `pickup_time`, `delivery_time`, `driver_id`

### `InvoiceSummary`
Type allégé pour les factures paginées contenant uniquement les champs essentiels :
- `id`, `invoice_number`, `order_id`, `client_id`
- `amount`, `status`, `created_at`
- `due_date`, `paid_at`

## Utilisation

### `getUserOrders`

**Signature :**
```typescript
getUserOrders(
    clientId: string,
    page: number = 1,
    limit: number = 10
): Promise<PaginatedResult<OrderSummary>>
```

**Exemple d'utilisation :**
```typescript
import { getUserOrders } from '@/services/supabaseQueries';

// Récupérer la première page (10 commandes)
const result = await getUserOrders('client-id-123');

// Récupérer la page 2 avec 20 commandes par page
const result2 = await getUserOrders('client-id-123', 2, 20);

// Utiliser les données
console.log(`Total de commandes : ${result.count}`);
console.log(`Page ${result.page} sur ${result.totalPages}`);
result.data.forEach(order => {
    console.log(`Commande ${order.id} - ${order.status} - ${order.total_amount}€`);
});
```

### `getInvoicesByUser`

**Signature :**
```typescript
getInvoicesByUser(
    clientId: string,
    page: number = 1,
    limit: number = 10
): Promise<PaginatedResult<InvoiceSummary>>
```

**Exemple d'utilisation :**
```typescript
import { getInvoicesByUser } from '@/services/supabaseQueries';

// Récupérer la première page (10 factures)
const result = await getInvoicesByUser('client-id-123');

// Récupérer la page 3 avec 15 factures par page
const result2 = await getInvoicesByUser('client-id-123', 3, 15);

// Utiliser les données
console.log(`Total de factures : ${result.count}`);
console.log(`Page ${result.page} sur ${result.totalPages}`);
result.data.forEach(invoice => {
    console.log(`Facture ${invoice.invoice_number} - ${invoice.status} - ${invoice.amount}€`);
});
```

## Exemple d'Implémentation dans un Composant React

```typescript
import { useState, useEffect } from 'react';
import { getUserOrders, PaginatedResult, OrderSummary } from '@/services/supabaseQueries';

function OrdersList({ clientId }: { clientId: string }) {
    const [orders, setOrders] = useState<PaginatedResult<OrderSummary> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const result = await getUserOrders(clientId, currentPage, 10);
                setOrders(result);
            } catch (error) {
                console.error('Erreur lors du chargement des commandes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [clientId, currentPage]);

    if (loading) return <div>Chargement...</div>;
    if (!orders) return <div>Aucune commande</div>;

    return (
        <div>
            <h2>Mes Commandes ({orders.count} au total)</h2>
            
            {/* Liste des commandes */}
            <ul>
                {orders.data.map(order => (
                    <li key={order.id}>
                        {order.pickup_address} → {order.delivery_address}
                        <br />
                        Statut: {order.status} | Montant: {order.total_amount}€
                    </li>
                ))}
            </ul>

            {/* Pagination */}
            <div className="pagination">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    Précédent
                </button>
                
                <span>Page {currentPage} sur {orders.totalPages}</span>
                
                <button 
                    onClick={() => setCurrentPage(p => Math.min(orders.totalPages, p + 1))}
                    disabled={currentPage === orders.totalPages}
                >
                    Suivant
                </button>
            </div>
        </div>
    );
}
```

## Avantages de l'Optimisation

### Performance
- **Réduction de la charge réseau** : Seuls les champs nécessaires sont transférés
- **Pagination** : Limite le nombre d'enregistrements chargés à la fois
- **Temps de réponse** : Requêtes plus rapides grâce à la sélection explicite

### Scalabilité
- **Gestion de gros volumes** : Peut gérer des milliers de commandes/factures sans problème
- **Expérience utilisateur** : Chargement rapide même avec beaucoup de données

### Exemple de Gain
**Avant :**
- Récupération de TOUTES les commandes avec TOUS les champs
- Pour 1000 commandes avec ~30 champs chacune = ~30 000 valeurs transférées

**Après :**
- Récupération de 10 commandes avec 14 champs chacune = ~140 valeurs transférées
- **Gain : ~99.5% de réduction des données transférées**

## Migration du Code Existant

Si vous utilisez déjà ces fonctions dans votre code, voici comment migrer :

### Avant
```typescript
const orders = await getUserOrders(clientId);
// orders est un tableau : OrderWithDriver[]
```

### Après
```typescript
const result = await getUserOrders(clientId);
// result.data est le tableau : OrderSummary[]
// result.count contient le nombre total
// result.totalPages contient le nombre de pages

// Accès aux données
const orders = result.data;
```

## Notes Importantes

1. **Valeurs par défaut** : Si vous n'indiquez pas `page` et `limit`, les valeurs par défaut sont `page=1` et `limit=10`
2. **Type de retour** : Les fonctions retournent maintenant `OrderSummary` et `InvoiceSummary` au lieu des types complets
3. **Champs manquants** : Si vous avez besoin de champs supplémentaires, utilisez `getOrderById()` pour récupérer les détails complets d'une commande spécifique
