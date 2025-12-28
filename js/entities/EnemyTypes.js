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
    demon: {
        hp: 80,
        moveDelay: 550,
        attackDelay: 1300,
        damage: { min: 18, max: 28 },
        goldDrop: { min: 30, max: 60 },
        expReward: 150
    }
};
