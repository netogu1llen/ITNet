const db = require('../util/database');

class Rol {

    //extraer roles
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
    
    //extraer privilegios
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

    //insertar rol y sacar su Id
    static async insertRol({Tipo}) {
        try {
            const [result] = await db.execute(`
                INSERT INTO rol (Tipo) VALUES (?)
	    `, [Tipo]);
	     return result.insertId;
	} catch (error) {
            throw error;
	} 
    }

    //insertar privilegios asociados al rol
    async assignPrivileges(IDRol, actividades) {
        const promises = actividades.map(async (IDPrivilegio) => {
            return await db.execute(
                'INSERT INTO rolPrivilegio (IDRol, IDPrivilegio) VALUES (?, ?)',
                [IDRol, IDPrivilegio]
            );
        });
        return Promise.all(promises);
    }

    async save(actividades) {
        try {
            const IDRol = await Rol.insertRol();
            await this.assignPrivileges(IDRol, actividades);
        } catch (error) {
            console.error('Error guardando rol y privilegios:', error);
            throw error;
        }
    }

}
module.exports = Rol;
