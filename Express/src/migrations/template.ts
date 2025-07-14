// import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

// export class Template implements MigrationInterface {
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.addColumn(
//       "link",
//       new TableColumn({
//         name: "id",
//         type: "character varying",
//         isNullable: true,
//       })
//     );
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.dropColumn("link", "link");
//     await queryRunner.dropTable("link");
//   }
// }
