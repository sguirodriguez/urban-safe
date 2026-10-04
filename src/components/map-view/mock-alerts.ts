export type AlertCategory = 'furto' | 'assalto' | 'tiroteio';

export interface Alert {
    id: string;
    category: AlertCategory;
    lat: number;
    lng: number;
}

export const mockAlerts: Alert[] = [
    { id: '1', category: 'furto', lat: -23.4995, lng: -47.4550 }, //CENTRO
    { id: '2', category: 'assalto', lat: -23.4890, lng: -47.4610 }, // JD VERGUEIRO
    { id: '3', category: 'tiroteio', lat: -23.5145, lng: -47.4720 }, //CAMPOLIM
    { id: '4', category: 'furto', lat: -23.4930, lng: -47.4400 }, //VILA HORTENCIA
    { id: '5', category: 'assalto', lat: -23.5080, lng: -47.4460 }, //VL BARAO
];