const db = require('../util/database');

class Rol {

    static async fetchAll() {
        try {
            const [results] = await db.execute(`
                SELECT Tipo FROM rol
            `);
            return results;
        } catch (error) {
            throw error;
        }
    }


}
module.exports = Rol;
