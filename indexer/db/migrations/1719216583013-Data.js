module.exports = class Data1719216583013 {
    name = 'Data1719216583013'

    async up(db) {
        await db.query(`ALTER TABLE "dns" DROP COLUMN "admins"`)
        await db.query(`ALTER TABLE "program" ADD "admin" text`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "dns" ADD "admins" text array NOT NULL`)
        await db.query(`ALTER TABLE "program" DROP COLUMN "admin"`)
    }
}
