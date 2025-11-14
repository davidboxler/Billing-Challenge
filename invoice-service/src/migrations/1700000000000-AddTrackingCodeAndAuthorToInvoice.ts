import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrackingCodeAndAuthorToInvoice1700000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "invoices"
      ADD COLUMN "trackingCode" character varying(255) NOT NULL DEFAULT '',
      ADD COLUMN "author" character varying(255) NOT NULL DEFAULT '';
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_tracking_code" ON "invoices" ("trackingCode");
    `);

    // Remove default values after adding columns
    await queryRunner.query(`
      ALTER TABLE "invoices"
      ALTER COLUMN "trackingCode" DROP DEFAULT,
      ALTER COLUMN "author" DROP DEFAULT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_tracking_code";`);
    await queryRunner.query(`
      ALTER TABLE "invoices"
      DROP COLUMN "trackingCode",
      DROP COLUMN "author";
    `);
  }
}
