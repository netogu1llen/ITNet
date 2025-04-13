const db = require('../util/database');

class Rol {

    static async fetchRoles() {
        try {
            const [results] = await db.execute(`
                SELECT Tipo FROM rol
            `);
            return results;
        } catch (error) {
            throw error;
        }
    }
    
    static async fetchPrivilegios() {
        try {
            const [results] = await db.execute(`
                SELECT Actividad FROM privilegios
            `);
            return results;
        } catch (error) {
            throw error;
        }
    }
	
    static async save({Tipo}) {
        try {
            const [result] = await db.execute(`
                INSERT INTO rol (Tipo) VALUES (?)
	    `, [Tipo]);
	     return result;
	} catch (error) {
            throw error;
	} 
    }

}
module.exports = Rol;
