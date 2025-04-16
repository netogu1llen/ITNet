const db = require('../util/database');

class Rol {
    constructor(Tipo) {
        this.Tipo = Tipo;
    }

    //extraer roles
    static async fetchRoles() {
        try {
            const [results] = await db.execute(`
                SELECT * FROM rol
		WHERE eliminado is NULL or eliminado = 0;
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
                SELECT * FROM privilegios
            `);
            return results;
        } catch (error) {
            throw error;
        }
    }
    
    static async exists(Tipo) {
        try {
            const [results] = await db.execute(`
                SELECT COUNT(*) as count FROM rol WHERE Tipo = ?
            `, [Tipo]);
            return results[0].count > 0;
        } catch (error) {
            throw error;
        }
    }

    //insertar rol y sacar su Id
    static async insertRol(Tipo) {
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
                'INSERT INTO rolPrivilegios (IDRol, IDPrivilegio) VALUES (?, ?)',
                [IDRol, IDPrivilegio]
            );
        });
        return Promise.all(promises);
    }

    // Obtener rol por ID
    static async fetchRolByID(IDRol) {
        try {
            const [results] = await db.execute(`
                SELECT * FROM rol
                WHERE IDRol = ?
            `, [IDRol]);
            return results[0];
        } catch (error) {
            throw error;
        }
    }  

    // Obtener privilegios del rol
    static async fetchPrivilegiosPorRol(IDRol) {
        try {
            const [results] = await db.execute(`
                SELECT IDPrivilegio FROM rolPrivilegios
                WHERE IDRol = ?
            `, [IDRol]);
            return results.map(row => row.IDPrivilegio);
        } catch (error) {
            throw error;
        }
    }

    // Actualizar nombre del rol
    static async editarTipo(IDRol, nuevoNombre) {
        try {
            const [result] = await db.execute(`
                UPDATE rol SET Tipo = ?
                WHERE IDRol = ?
            `, [nuevoNombre, IDRol]);
            return true;
        } catch (error) {
            throw error;
        }
    }
    
    // Eliminar todos los privilegios de un rol
    static async eliminarPrivilegios(IDRol) {
        try {
            const [result] = await db.execute(`
                DELETE FROM rolPrivilegios
                WHERE IDRol = ?
            `, [IDRol]);
            return result;
        } catch (error) {
            console.error('Error al eliminar privilegios del rol:', error.message);
            throw error;
        }
    }

    // Borrado lógico rol
    static async borradoLogico(IDRol) {
        try {
            const [result] = await dv.execute(`
                UPDATE rol SET eliminado = 1
		WHERE IDRol = ?
            `, [IDRol]);
            return results;
	} catch (error) {
            throw error;
	}
    }
}
module.exports = Rol;

