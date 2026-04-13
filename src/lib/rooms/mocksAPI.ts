export type ResourceIconType = "monitor" | "video" | "snowflake";

export type ResourceCatalogItem = {
    id: string;
    name: string;
    description: string;
    icon: ResourceIconType;
};

export type RoomResourceItem = {
    id: string;
    name: string;
    description: string;
    quantity: number;
    icon: ResourceIconType;
};

export type RoomMock = {
    id: string;
    name: string;
    location: string;
    faculty: string;
    capacity: number;
    resources: RoomResourceItem[];
    createdAt: string;
};

export const defaultFaculty = "Ingeniería";

export const availableResources: ResourceCatalogItem[] = [
    {
        id: "pantalla-interactiva-65",
        name: 'Pantalla Interactiva 65"',
        description: "Pantalla táctil",
        icon: "monitor",
    },
    {
        id: "videoconferencia-logitech-meetup",
        name: "Sistema de Videoconferencia",
        description: "Logitech MeetUp",
        icon: "video",
    },
    {
        id: "aire-acondicionado",
        name: "Aire Acondicionado",
        description: "Control independiente",
        icon: "snowflake",
    },
    {
        id: "proyector-laser",
        name: "Proyector Láser",
        description: "Resolución Full HD",
        icon: "monitor",
    },
    {
        id: "barra-sonido",
        name: "Barra de Sonido",
        description: "Audio envolvente",
        icon: "video",
    },
];

export const roomsMock: RoomMock[] = [
    {
        id: "room-001",
        name: "Sala de Juntas 1",
        location: "Edificio Central, Piso 2",
        faculty: "Ingeniería",
        capacity: 20,
        resources: [
            {
                id: "pantalla-interactiva-65",
                name: 'Pantalla Interactiva 65"',
                description: "Pantalla táctil",
                quantity: 1,
                icon: "monitor",
            },
            {
                id: "videoconferencia-logitech-meetup",
                name: "Sistema de Videoconferencia",
                description: "Logitech MeetUp",
                quantity: 1,
                icon: "video",
            },
            {
                id: "aire-acondicionado",
                name: "Aire Acondicionado",
                description: "Control independiente",
                quantity: 1,
                icon: "snowflake",
            },
        ],
        createdAt: new Date().toISOString(),
    },
];

export const getRoomsMock = () => roomsMock;

export const saveRoomMock = (
    room: Omit<RoomMock, "id" | "createdAt">
): RoomMock => {
    const newRoom: RoomMock = {
        id: `room-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...room,
    };

    roomsMock.push(newRoom);
    return newRoom;
};
