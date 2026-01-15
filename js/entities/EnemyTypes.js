// Enemy types and stats (inspirado en NPCs.dat de AO)
export const ENEMY_STATS = {
    goblin: {
        hp: 30,
        moveDelay: 800,
        attackDelay: 2000,
        damage: { min: 5, max: 10 },
        goldDrop: { min: 10, max: 20 },
        expReward: 40
    },
    skeleton: {
        hp: 25,
        moveDelay: 900,
        attackDelay: 1800,
        damage: { min: 4, max: 9 },
        goldDrop: { min: 8, max: 18 },
        expReward: 35
    },
    bandit: {
        hp: 20,
        moveDelay: 1000,
        attackDelay: 2500,
        damage: { min: 3, max: 8 },
        goldDrop: { min: 15, max: 25 },
        expReward: 25
    },
    orc: {
        hp: 50,
        moveDelay: 600,
        attackDelay: 1500,
        damage: { min: 8, max: 15 },
        goldDrop: { min: 20, max: 40 },
        expReward: 80
    },
    troll: {
        hp: 120,
        moveDelay: 500,
        attackDelay: 1200,
        damage: { min: 15, max: 25 },
        goldDrop: { min: 50, max: 100 },
        expReward: 200
    },
    dragon: {
        hp: 200,
        moveDelay: 400,
        attackDelay: 1000,
        damage: { min: 20, max: 35 },
        goldDrop: { min: 100, max: 200 },
        expReward: 500
    },
    elemental: {
        hp: 60,
        moveDelay: 700,
        attackDelay: 1600,
        damage: { min: 12, max: 20 },
        goldDrop: { min: 25, max: 45 },
        expReward: 100
    },
    // ===== NUEVOS ENEMIGOS PARA EL MUNDO =====
    slime: {
        hp: 20,
        moveDelay: 1000,
        attackDelay: 2500,
        damage: { min: 2, max: 6 },
        goldDrop: { min: 5, max: 12 },
        expReward: 15
    },
    wolf: {
        hp: 35,
        moveDelay: 700,
        attackDelay: 1800,
        damage: { min: 6, max: 12 },
        goldDrop: { min: 12, max: 25 },
        expReward: 45
    },
    spider: {
        hp: 28,
        moveDelay: 650,
        attackDelay: 1600,
        damage: { min: 4, max: 9 },
        goldDrop: { min: 8, max: 16 },
        expReward: 30
    },
    bear: {
        hp: 90,
        moveDelay: 500,
        attackDelay: 1200,
        damage: { min: 14, max: 22 },
        goldDrop: { min: 35, max: 70 },
        expReward: 120
    },
    mountain_goat: {
        hp: 45,
        moveDelay: 600,
        attackDelay: 1400,
        damage: { min: 9, max: 16 },
        goldDrop: { min: 18, max: 32 },
        expReward: 65
    },
    cave_golem: {
        hp: 150,
        moveDelay: 450,
        attackDelay: 1100,
        damage: { min: 18, max: 28 },
        goldDrop: { min: 40, max: 80 },
        expReward: 250
    },
    ancient_guardian: {
        hp: 180,
        moveDelay: 400,
        attackDelay: 1000,
        damage: { min: 22, max: 32 },
        goldDrop: { min: 60, max: 120 },
        expReward: 350
    },
    mountain_troll: {
        hp: 140,
        moveDelay: 480,
        attackDelay: 1150,
        damage: { min: 16, max: 26 },
        goldDrop: { min: 45, max: 90 },
        expReward: 220
    },
    bat: {
        hp: 15,
        moveDelay: 800,
        attackDelay: 2000,
        damage: { min: 1, max: 4 },
        goldDrop: { min: 3, max: 8 },
        expReward: 8
    },
    cave_troll: {
        hp: 100,
        moveDelay: 520,
        attackDelay: 1250,
        damage: { min: 12, max: 20 },
        goldDrop: { min: 25, max: 50 },
        expReward: 140
    },
    mountain_giant: {
        hp: 220,
        moveDelay: 380,
        attackDelay: 950,
        damage: { min: 25, max: 38 },
        goldDrop: { min: 80, max: 150 },
        expReward: 400
    },

    demon: {
        hp: 80,
        moveDelay: 550,
        attackDelay: 1300,
        damage: { min: 18, max: 28 },
        goldDrop: { min: 30, max: 60 },
        expReward: 150
    }
};
