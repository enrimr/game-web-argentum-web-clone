/**
 * Test Runner Simple - Sin frameworks
 * Sistema de testing básico para validar funcionalidad del juego
 */

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }
    
    /**
     * Registra un test
     */
    test(name, testFn) {
        this.tests.push({ name, testFn });
    }
    
    /**
     * Ejecuta todos los tests
     */
    async run() {
        console.log('🧪 Ejecutando tests...\n');
        
        for (const test of this.tests) {
            try {
                await test.testFn();
                this.results.passed++;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.results.failed++;
                console.error(`❌ ${test.name}`);
                console.error(`   Error: ${error.message}`);
            }
            this.results.total++;
        }
        
        this.printResults();
    }
    
    /**
     * Imprime resultados finales
     */
    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log(`📊 Resultados: ${this.results.passed}/${this.results.total} tests pasados`);
        
        if (this.results.failed > 0) {
            console.log(`❌ ${this.results.failed} tests fallaron`);
        } else {
            console.log('✅ Todos los tests pasaron!');
        }
        console.log('='.repeat(50));
    }
}

/**
 * Funciones de aserción
 */
const assert = {
    equals(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message}\n  Esperado: ${expected}\n  Recibido: ${actual}`);
        }
    },
    
    notEquals(actual, expected, message = '') {
        if (actual === expected) {
            throw new Error(`${message}\n  No debería ser: ${expected}`);
        }
    },
    
    isTrue(value, message = 'Debería ser true') {
        if (value !== true) {
            throw new Error(`${message}\n  Recibido: ${value}`);
        }
    },
    
    isFalse(value, message = 'Debería ser false') {
        if (value !== false) {
            throw new Error(`${message}\n  Recibido: ${value}`);
        }
    },
    
    isNull(value, message = 'Debería ser null') {
        if (value !== null) {
            throw new Error(`${message}\n  Recibido: ${value}`);
        }
    },
    
    notNull(value, message = 'No debería ser null') {
        if (value === null) {
            throw new Error(message);
        }
    },
    
    exists(value, message = 'Debería existir') {
        if (value === undefined || value === null) {
            throw new Error(`${message}\n  Recibido: ${value}`);
        }
    },
    
    isArray(value, message = 'Debería ser un array') {
        if (!Array.isArray(value)) {
            throw new Error(`${message}\n  Recibido: ${typeof value}`);
        }
    },
    
    isObject(value, message = 'Debería ser un objeto') {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            throw new Error(`${message}\n  Recibido: ${typeof value}`);
        }
    },
    
    isFunction(value, message = 'Debería ser una función') {
        if (typeof value !== 'function') {
            throw new Error(`${message}\n  Recibido: ${typeof value}`);
        }
    },
    
    greaterThan(actual, expected, message = '') {
        if (actual <= expected) {
            throw new Error(`${message}\n  ${actual} debería ser mayor que ${expected}`);
        }
    },
    
    lessThan(actual, expected, message = '') {
        if (actual >= expected) {
            throw new Error(`${message}\n  ${actual} debería ser menor que ${expected}`);
        }
    },
    
    contains(array, value, message = 'Array debería contener el valor') {
        if (!array.includes(value)) {
            throw new Error(`${message}\n  Valor: ${value}`);
        }
    },
    
    throws(fn, message = 'Función debería lanzar error') {
        try {
            fn();
            throw new Error(message);
        } catch (error) {
            // Esperamos que lance error
            if (error.message === message) {
                throw error;
            }
        }
    }
};

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestRunner, assert };
}
