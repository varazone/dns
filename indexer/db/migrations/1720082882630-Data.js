module.exports = class Data1720082882630 {
  name = 'Data1720082882630'

  async up(db) {
    await db.query(`ALTER TABLE "program" ADD "admins" text array`);
    await db.query(`UPDATE "program" set admins=ARRAY[admin];`);
    await db.query(`ALTER TABLE "program" ALTER COLUMN "admins" SET NOT NULL;`);
  }

  async down(db) {
    await db.query(`ALTER TABLE "program" DROP COLUMN "admins"`);
  }
}
