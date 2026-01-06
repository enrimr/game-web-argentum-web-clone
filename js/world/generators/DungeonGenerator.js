/**
 * DungeonGenerator.js
 * Generador para mazmorras y niveles de mazmorra
 */

import { CONFIG } from '../../config.js';
import { TILES } from '../TileTypes.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * Generate dungeon map (main dungeon level)
 * @returns {Array} 2D array representing the dungeon map
 */
export function generateDungeonMap() {
    const map = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = TILES.DUNGEON_WALL;
        }
    }
    generateConnectedDungeon(map, { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT });
    return map;
}

/**
 * Generate deep dungeon map (more dangerous dungeon)
 * @returns {Array} 2D array representing the deep dungeon map
 */
export function generateDeepDungeonMap() {
    const map = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = TILES.DUNGEON_WALL;
        }
    }
    generateConnectedDungeon(map, { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT });
    return map;
}

/**
 * Generate connected dungeon with guaranteed accessibility
 * @param {Array} map - Map array to modify
 * @param {Object} bounds - Boundaries for dungeon {x, y, width, height}
 */
export function generateConnectedDungeon(map, bounds) {
    // Initialize with walls
    for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
        for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
            if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                map[y][x] = TILES.DUNGEON_WALL;
            }
        }
    }

    const rooms = [];
    const minRoomSize = 3;
    const maxRoomSize = 6;

    // Create rooms with guaranteed spacing
    for (let attempts = 0; attempts < 20 && rooms.length < 8; attempts++) {
        const roomW = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));
        const roomH = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));

        const roomX = bounds.x + 2 + Math.floor(Math.random() * (bounds.width - roomW - 4));
        const roomY = bounds.y + 2 + Math.floor(Math.random() * (bounds.height - roomH - 4));

        // Check if room fits and doesn't overlap existing rooms
        let canPlace = true;
        for (let y = roomY - 1; y < roomY + roomH + 1 && canPlace; y++) {
            for (let x = roomX - 1; x < roomX + roomW + 1 && canPlace; x++) {
                if (x >= bounds.x && x < bounds.x + bounds.width &&
                    y >= bounds.y && y < bounds.y + bounds.height) {
                    if (map[y][x] === TILES.FLOOR) {
                        canPlace = false;
                    }
                }
            }
        }

        if (canPlace) {
            // Carve the room
            for (let y = roomY; y < roomY + roomH; y++) {
                for (let x = roomX; x < roomX + roomW; x++) {
                    if (x >= bounds.x && x < bounds.x + bounds.width &&
                        y >= bounds.y && y < bounds.y + bounds.height) {
                        map[y][x] = TILES.FLOOR;
                    }
                }
            }

            // Store room center for connecting
            const centerX = Math.floor(roomX + roomW / 2);
            const centerY = Math.floor(roomY + roomH / 2);
            rooms.push({ x: centerX, y: centerY });
        }
    }

    // Ensure we have at least 3 rooms
    if (rooms.length < 3) {
        // Create minimum rooms if needed
        const forcedRooms = [
            { x: bounds.x + 3, y: bounds.y + 3, w: 4, h: 4 },
            { x: bounds.x + bounds.width - 7, y: bounds.y + 3, w: 4, h: 4 },
            { x: bounds.x + Math.floor(bounds.width / 2) - 2, y: bounds.y + bounds.height - 7, w: 4, h: 4 }
        ];

        for (const room of forcedRooms) {
            for (let y = room.y; y < room.y + room.h; y++) {
                for (let x = room.x; x < room.x + room.w; x++) {
                    if (x >= bounds.x && x < bounds.x + bounds.width &&
                        y >= bounds.y && y < bounds.y + bounds.height) {
                        map[y][x] = TILES.FLOOR;
                    }
                }
            }
            rooms.push({ x: room.x + Math.floor(room.w / 2), y: room.y + Math.floor(room.h / 2) });
        }
    }

    // Connect all rooms with corridors (minimum spanning tree approach)
    if (rooms.length > 1) {
        // Start with first room
        const connected = new Set([0]);

        while (connected.size < rooms.length) {
            let bestDistance = Infinity;
            let bestConnection = null;

            // Find closest unconnected room to any connected room
            for (const connectedIdx of connected) {
                for (let i = 0; i < rooms.length; i++) {
                    if (!connected.has(i)) {
                        const dist = Math.abs(rooms[connectedIdx].x - rooms[i].x) +
                                   Math.abs(rooms[connectedIdx].y - rooms[i].y);
                        if (dist < bestDistance) {
                            bestDistance = dist;
                            bestConnection = { from: connectedIdx, to: i };
                        }
                    }
                }
            }

            if (bestConnection) {
                // Connect the rooms
                connectRooms(map, rooms[bestConnection.from], rooms[bestConnection.to], bounds);
                connected.add(bestConnection.to);
            } else {
                break; // No more connections possible
            }
        }
    }

    // Create entrance from main path (bottom of dungeon zone)
    const entranceY = bounds.y + bounds.height - 1;
    const entranceX = Math.floor(bounds.x + bounds.width / 2);

    if (entranceX >= bounds.x && entranceX < bounds.x + bounds.width &&
        entranceY >= bounds.y && entranceY < bounds.y + bounds.height) {

        // Find nearest room to connect to entrance
        let nearestRoom = null;
        let minDistance = Infinity;

        for (const room of rooms) {
            const dist = Math.abs(room.x - entranceX) + Math.abs(room.y - entranceY);
            if (dist < minDistance) {
                minDistance = dist;
                nearestRoom = room;
            }
        }

        if (nearestRoom) {
            // Connect entrance to nearest room
            connectRooms(map, { x: entranceX, y: entranceY }, nearestRoom, bounds);
        }
    }
}

/**
 * Connect two points with a corridor (minimum 2 tiles wide for better gameplay)
 * @param {Array} map - Map array to modify
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point {x, y}
 * @param {Object} bounds - Boundaries {x, y, width, height}
 */
function connectRooms(map, point1, point2, bounds) {
    const corridorWidth = 2; // Minimum 2 tiles wide

    // Horizontal corridor first (made wider)
    const startX = Math.min(point1.x, point2.x);
    const endX = Math.max(point1.x, point2.x);

    for (let x = startX; x <= endX; x++) {
        for (let w = 0; w < corridorWidth; w++) {
            const corridorY = point1.y + w - Math.floor(corridorWidth / 2);
            if (x >= bounds.x && x < bounds.x + bounds.width &&
                corridorY >= bounds.y && corridorY < bounds.y + bounds.height) {
                map[corridorY][x] = TILES.FLOOR;
            }
        }
    }

    // Vertical corridor (made wider)
    const startY = Math.min(point1.y, point2.y);
    const endY = Math.max(point1.y, point2.y);

    for (let y = startY; y <= endY; y++) {
        for (let w = 0; w < corridorWidth; w++) {
            const corridorX = point2.x + w - Math.floor(corridorWidth / 2);
            if (corridorX >= bounds.x && corridorX < bounds.x + bounds.width &&
                y >= bounds.y && y < bounds.y + bounds.height) {
                map[y][corridorX] = TILES.FLOOR;
            }
        }
    }

    // Ensure the intersection area is fully connected (L-shaped connection)
    const intersectionX = point2.x;
    const intersectionY = point1.y;

    for (let dx = -Math.floor(corridorWidth / 2); dx <= Math.floor(corridorWidth / 2); dx++) {
        for (let dy = -Math.floor(corridorWidth / 2); dy <= Math.floor(corridorWidth / 2); dy++) {
            const ix = intersectionX + dx;
            const iy = intersectionY + dy;
            if (ix >= bounds.x && ix < bounds.x + bounds.width &&
                iy >= bounds.y && iy < bounds.y + bounds.height) {
                map[iy][ix] = TILES.FLOOR;
            }
        }
    }
}
