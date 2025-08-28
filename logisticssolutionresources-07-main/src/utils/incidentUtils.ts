
import { IncidentType } from '@/types/incident';

export function getIncidentTypeLabel(type: IncidentType): string {
  switch (type) {
    case IncidentType.transportation:
      return 'Transportation';
    case IncidentType.school:
      return 'School';
    case IncidentType.wedding:
      return 'Wedding';
    case IncidentType.airport:
      return 'Airport Run';
    case IncidentType.privateJob:
      return 'Private Job';
    default:
      return 'Unknown';
  }
}

export function getIncidentTypeIcon(type: IncidentType): string {
  switch (type) {
    case IncidentType.transportation:
      return 'directions_bus';
    case IncidentType.school:
      return 'school';
    case IncidentType.wedding:
      return 'favorite';
    case IncidentType.airport:
      return 'flight_takeoff';
    case IncidentType.privateJob:
      return 'build';
    default:
      return 'help';
  }
}
