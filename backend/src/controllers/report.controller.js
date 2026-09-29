const reportService = require('../services/report.service');
const { sendSuccess } = require('../utils/response');

class ReportController {
  /**
   * Get structured JSON monthly civic engagement report
   */
  async getMonthlyReport(req, res, next) {
    try {
      const report = await reportService.generateMonthlyReport(req.query);
      return sendSuccess(
        res,
        200,
        'Monthly civic engagement report generated successfully',
        report
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export monthly report as CSV file
   */
  async exportMonthlyReport(req, res, next) {
    try {
      const csvData = await reportService.generateMonthlyReportCsv(req.query);
      const { month, year } = reportService.getPeriodRange(req.query);

      const filename = `civic-engagement-report-${year}-${String(month).padStart(2, '0')}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
