
**Trip (JSON)**

```json
{
	"id": "",
 	"name": "",
	"destinationType": "",
	"duration": null,
	"checklist": [
		{ "label": "", "completed": false}
	],
	"createdAt": ""
}
```

Field explanations:

- `id` (string): application-generated UUID for the trip record.
- `name` (string): name of the trip.
- `destinationType` (string): category of destination (e.g., "beach", "mountain").
- `duration` (integer|null): number of days for the trip; `null` if unspecified.
- `checklist` (array): list of checklist items; each item is an object with:
	- `label` (string): text for the checklist entry.
	- `completed` (boolean): whether the item is done.
- `createdAt` (string): timestamp for when the trip was created.


**Key fields**
- `name`, `destinationType`, and `duration` are required for creating a Trip.

**Constraints & Assumptions (MVP simplifications)**
- Authentication: authentication is not enforced.
- Persistence: Using local json storage to reduce the maintainance overhead and focus on core functionaly.


