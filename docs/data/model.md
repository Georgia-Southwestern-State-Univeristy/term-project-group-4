# Data Model

## Logical API Model

### Trip

```json
{
  "id": "",
  "name": "",
  "destinationType": "",
  "duration": 0,
  "checklist": [
    {
      "id": "",
      "name": "",
      "category": "",
      "packed": false
    }
  ],
  "createdAt": ""
}
```

### Field explanations

- `id` (string): application-generated UUID for the trip
- `name` (string): user-provided trip name
- `destinationType` (string): trip category such as beach, city, or outdoors
- `duration` (integer): number of days for the trip; must be a positive integer
- `checklist` (array): list of checklist items for the trip
- `createdAt` (string): ISO timestamp for when the trip was created

**Key fields**
- `name`, `destinationType`, and `duration` are required for creating a Trip.

### Checklist item fields
- `id` (string): item identifier within the trip
- `name` (string): checklist item name
- `category` (string): grouping label such as Essentials, Beach, or Clothing
- `packed` (boolean): whether the item is marked packed

## Database Schema

### users

- `id` (primary key)  
- `google_id` (unique)  
- `email`  
- `name`
- `picture`  
- `created_at`

### trips

- `id` (primary key)  
- `user_id` (foreign key to users.id)  
- `name`  
- `destination_type`
- `duration`
- `created_at`

### checklist_items

- `id`
- `trip_id` (foreign key to trips.id)  
- `name`  
- `category`
- `packed`  
- `sort_order`

**Primary key:** (trip_id, id)

**Constraints & Assumptions (MVP simplifications)**
- Authentication is enforced on all `/api/*` routes  
- Each trip is owned by exactly one user  
- Users can only access their own trips  
- Cross-user access returns `404 Not Found`  
- Local development uses Knex with SQLite  
- The project is structured to support PostgreSQL as a future or alternate deployment target  