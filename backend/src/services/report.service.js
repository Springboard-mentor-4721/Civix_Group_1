const Petition = require('../models/petition.model');
const Signature = require('../models/signature.model');
const Poll = require('../models/poll.model');
const Vote = require('../models/vote.model');
const OfficialResponse = require('../models/official-response.model');

class ReportService {
  /**
   * Helper to parse and calculate month date range
   */
  getPeriodRange(queryParams) {
    const now = new Date();
    const month = queryParams.month ? parseInt(queryParams.month, 10) : now.getUTCMonth() + 1;
    const year = queryParams.year ? parseInt(queryParams.year, 10) : now.getUTCFullYear();

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    // Day 0 of next month is the last day of current month
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return { month, year, startDate, endDate };
  }

  /**
   * Generate monthly civic engagement report metrics
   */
  async generateMonthlyReport(queryParams = {}) {
    const { month, year, startDate, endDate } = this.getPeriodRange(queryParams);

    const petitionFilter = {
      createdAt: { $gte: startDate, $lte: endDate }
    };
    const pollFilter = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (queryParams.city) {
      const cityRegex = new RegExp(queryParams.city.trim(), 'i');
      petitionFilter['location.city'] = cityRegex;
      pollFilter['location.city'] = cityRegex;
    }

    if (queryParams.state) {
      const stateRegex = new RegExp(queryParams.state.trim(), 'i');
      petitionFilter['location.state'] = stateRegex;
      pollFilter['location.state'] = stateRegex;
    }

    if (queryParams.category) {
      petitionFilter.category = queryParams.category;
      pollFilter.category = queryParams.category;
    }

    // 1. Petitions in period
    const petitions = await Petition.find(petitionFilter).lean();
    const totalPetitions = petitions.length;

    const petitionsByStatus = {
      active: 0,
      under_review: 0,
      closed: 0,
      draft: 0,
      flagged: 0
    };
    const petitionsByCategory = {};
    const petitionsByCity = {};

    petitions.forEach((p) => {
      if (p.status) {
        petitionsByStatus[p.status] = (petitionsByStatus[p.status] || 0) + 1;
      }
      if (p.category) {
        petitionsByCategory[p.category] = (petitionsByCategory[p.category] || 0) + 1;
      }
      if (p.location && p.location.city) {
        petitionsByCity[p.location.city] = (petitionsByCity[p.location.city] || 0) + 1;
      }
    });

    // 2. Signatures in period
    const totalSignatures = await Signature.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // 3. Polls in period - auto close any expired polls first
    await Poll.updateMany(
      { status: 'active', endDate: { $ne: null, $lt: new Date() } },
      { $set: { status: 'closed' } }
    );

    const polls = await Poll.find(pollFilter).lean();
    const totalPolls = polls.length;

    const pollsByCategory = {};
    const pollsByStatus = { active: 0, closed: 0 };
    const now = new Date();

    polls.forEach((p) => {
      const isClosed = p.status === 'closed' || (p.endDate && new Date(p.endDate) < now);
      const effectiveStatus = isClosed ? 'closed' : 'active';
      pollsByStatus[effectiveStatus] = (pollsByStatus[effectiveStatus] || 0) + 1;

      if (p.category) {
        pollsByCategory[p.category] = (pollsByCategory[p.category] || 0) + 1;
      }
    });

    // 4. Votes in period
    const totalVotes = await Vote.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // 5. Official responses in period
    const officialResponses = await OfficialResponse.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();

    const totalOfficialResponses = officialResponses.length;
    const responsesByNewStatus = {
      under_review: 0,
      closed: 0,
      active: 0
    };

    officialResponses.forEach((r) => {
      if (r.newStatus) {
        responsesByNewStatus[r.newStatus] = (responsesByNewStatus[r.newStatus] || 0) + 1;
      }
    });

    // 6. Overall Civic Engagement Index
    const totalEngagementActivities =
      totalPetitions + totalSignatures + totalPolls + totalVotes + totalOfficialResponses;

    return {
      period: {
        month,
        monthName: startDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }),
        year,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      filters: {
        city: queryParams.city || null,
        state: queryParams.state || null,
        category: queryParams.category || null
      },
      summary: {
        totalEngagementActivities,
        totalPetitions,
        totalSignatures,
        totalPolls,
        totalVotes,
        totalOfficialResponses
      },
      petitions: {
        total: totalPetitions,
        byStatus: petitionsByStatus,
        byCategory: petitionsByCategory,
        byCity: petitionsByCity
      },
      polls: {
        total: totalPolls,
        byStatus: pollsByStatus,
        byCategory: pollsByCategory
      },
      officialResponses: {
        total: totalOfficialResponses,
        byNewStatus: responsesByNewStatus
      }
    };
  }

  /**
   * Generate RFC-4180 compliant CSV export of the monthly report
   */
  async generateMonthlyReportCsv(queryParams = {}) {
    const report = await this.generateMonthlyReport(queryParams);
    const { period, summary, petitions, polls, officialResponses } = report;

    const lines = [];

    // Header Metadata
    lines.push(`"Civix Digital Civic Engagement Monthly Report"`);
    lines.push(`"Period","${period.monthName} ${period.year}"`);
    lines.push(`"Start Date","${period.startDate}"`);
    lines.push(`"End Date","${period.endDate}"`);
    lines.push(``);

    // Summary Section
    lines.push(`"--- EXECUTIVE SUMMARY ---"`);
    lines.push(`"Metric","Count"`);
    lines.push(`"Total Civic Engagement Activities","${summary.totalEngagementActivities}"`);
    lines.push(`"Total Petitions Created","${summary.totalPetitions}"`);
    lines.push(`"Total Signatures Gathered","${summary.totalSignatures}"`);
    lines.push(`"Total Polls Created","${summary.totalPolls}"`);
    lines.push(`"Total Votes Cast","${summary.totalVotes}"`);
    lines.push(`"Total Official Responses","${summary.totalOfficialResponses}"`);
    lines.push(``);

    // Petition Status Breakdown
    lines.push(`"--- PETITIONS BY STATUS ---"`);
    lines.push(`"Status","Count"`);
    Object.entries(petitions.byStatus).forEach(([status, count]) => {
      lines.push(`"${status}","${count}"`);
    });
    lines.push(``);

    // Petition Category Breakdown
    lines.push(`"--- PETITIONS BY CATEGORY ---"`);
    lines.push(`"Category","Count"`);
    if (Object.keys(petitions.byCategory).length === 0) {
      lines.push(`"None","0"`);
    } else {
      Object.entries(petitions.byCategory).forEach(([cat, count]) => {
        lines.push(`"${cat}","${count}"`);
      });
    }
    lines.push(``);

    // Polls Breakdown
    lines.push(`"--- POLLS BY STATUS & CATEGORY ---"`);
    lines.push(`"Metric","Value","Count"`);
    Object.entries(polls.byStatus).forEach(([status, count]) => {
      lines.push(`"Status","${status}","${count}"`);
    });
    Object.entries(polls.byCategory).forEach(([cat, count]) => {
      lines.push(`"Category","${cat}","${count}"`);
    });
    lines.push(``);

    // Official Response Resolution Breakdown
    lines.push(`"--- OFFICIAL RESPONSES BY RESOLUTION STATUS ---"`);
    lines.push(`"Resolution Status","Count"`);
    Object.entries(officialResponses.byNewStatus).forEach(([status, count]) => {
      lines.push(`"${status}","${count}"`);
    });

    return lines.join('\n');
  }
}

module.exports = new ReportService();
