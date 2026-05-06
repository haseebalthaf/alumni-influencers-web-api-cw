const Profile = require('../models/Profile');

const getSkillsAnalytics = async (req, res) => {
  try {
    const skillsPipeline = [
      { $unwind: '$certifications' },
      {
        $group: {
          _id: '$certifications.title',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
        },
      },
    ];

    const data = await Profile.aggregate(skillsPipeline);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics getSkillsAnalytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving skills analytics',
    });
  }
};

const getIndustryDistribution = async (req, res) => {
  try {
    const industryPipeline = [
      { $unwind: '$employmentHistory' },
      {
        $group: {
          _id: '$employmentHistory.company',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$_id', 'Unknown'] },
          count: 1,
        },
      },
    ];

    const data = await Profile.aggregate(industryPipeline);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics getIndustryDistribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving industry distribution',
    });
  }
};

const getCareerPaths = async (req, res) => {
  try {
    const careerPipeline = [
      { $unwind: '$degrees' },
      { $unwind: '$employmentHistory' },
      {
        $group: {
          _id: {
            degree: '$degrees.title',
            role: '$employmentHistory.position',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          degree: '$_id.degree',
          role: '$_id.role',
          count: 1,
        },
      },
      { $limit: 20 },
    ];

    const data = await Profile.aggregate(careerPipeline);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics getCareerPaths error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving career path analytics',
    });
  }
};

const getCertificationTrends = async (req, res) => {
  try {
    const trendPipeline = [
      { $unwind: '$certifications' },
      {
        $group: {
          _id: {
            year: { $year: '$certifications.completionDate' },
            month: { $month: '$certifications.completionDate' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: {
                  if: { $lt: ['$_id.month', 10] },
                  then: { $concat: ['0', { $toString: '$_id.month' }] },
                  else: { $toString: '$_id.month' },
                },
              },
            ],
          },
          count: 1,
        },
      },
      { $sort: { month: 1 } },
    ];

    const data = await Profile.aggregate(trendPipeline);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics getCertificationTrends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving certification trends',
    });
  }
};

const getAlumniGrowth = async (req, res) => {
  try {
    const growthPipeline = [
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: {
                  if: { $lt: ['$_id.month', 10] },
                  then: { $concat: ['0', { $toString: '$_id.month' }] },
                  else: { $toString: '$_id.month' },
                },
              },
            ],
          },
          count: 1,
        },
      },
      { $sort: { month: 1 } },
    ];

    const data = await Profile.aggregate(growthPipeline);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics getAlumniGrowth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving alumni growth analytics',
    });
  }
};

const getCoursesLicences = async (req, res) => {
  try {
    const coursesPipeline = [
      { $unwind: '$courses' },
      {
        $group: {
          _id: '$courses.title',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$_id', 'Unknown'] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ];

    const licencesPipeline = [
      { $unwind: '$licences' },
      {
        $group: {
          _id: '$licences.title',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$_id', 'Unknown'] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ];

    const [courses, licences] = await Promise.all([
      Profile.aggregate(coursesPipeline),
      Profile.aggregate(licencesPipeline),
    ]);

    const merged = {};

    [...courses, ...licences].forEach((item) => {
      if (!item || !item.name) return;
      merged[item.name] = (merged[item.name] || 0) + item.count;
    });

    const data = Object.entries(merged)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics getCoursesLicences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving courses and licences analytics',
    });
  }
};

module.exports = {
  getSkillsAnalytics,
  getIndustryDistribution,
  getCareerPaths,
  getCertificationTrends,
  getAlumniGrowth,
  getCoursesLicences,
};
