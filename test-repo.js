const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/appModule.module');
const { ReportRepository } = require('./dist/src/entities/report-entities/report/report.repository');

async function run() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const repo = app.get(ReportRepository);
    // Fetch reports for descendants of unit 1
    const reports = await repo.fetchReportsDataForUnits('2026-03-01', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    const unitStatusMap = new Map();
    for (const r of reports) {
        const statusId = r.unit?.unitStatus?.[0]?.unitStatusId;
        if (!unitStatusMap.has(r.unitId)) {
            unitStatusMap.set(r.unitId, statusId ?? 'NO_STATUS');
        }
    }

    console.log('Unit -> Status mappings:');
    for (const [uid, status] of unitStatusMap) {
        console.log(`Unit ${uid}: statusId=${status}`);
    }
    console.log('\nTotal reports:', reports.length);

    await app.close();
}
run().catch(console.error);
