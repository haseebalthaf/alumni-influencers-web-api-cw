const Bid = require('../models/Bid');
const Profile = require('../models/Profile');
const Winner = require('../models/Winner');

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const createHttpError = (status, message, extra = {}) => {
  const error = new Error(message);
  error.status = status;
  Object.assign(error, extra);
  return error;
};

const getMonthKey = (date = new Date()) => date.toISOString().slice(0, 7);

const getTargetDate = ({ forToday = false } = {}) => {
  const targetDate = new Date();

  if (!forToday) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  targetDate.setHours(0, 0, 0, 0);
  return targetDate;
};

const getAllowedWinsForMonth = (profile, month) => {
  const activeMonthWins = profile.lastWinMonth === month ? profile.monthlyWins : 0;
  const extraWin = profile.eventParticipationMonth === month ? 1 : 0;

  return {
    activeMonthWins,
    allowedWins: 3 + extraWin,
  };
};

const findWinnerForDate = async (targetDate) => Winner.findOne({
  date: {
    $gte: targetDate,
    $lt: new Date(targetDate.getTime() + DAY_IN_MS),
  },
});

const selectWinnerForDate = async ({ forToday = false, strict = true } = {}) => {
  const targetDate = getTargetDate({ forToday });
  const dateLabel = forToday ? 'today' : 'tomorrow';
  const currentMonth = getMonthKey(new Date());
  const winnerMonth = getMonthKey(targetDate);

  const existingWinner = await findWinnerForDate(targetDate);
  if (existingWinner) {
    if (strict) {
      throw createHttpError(400, `Winner already selected for ${dateLabel}`);
    }

    return null;
  }

  const highestBid = await Bid.findOne({
    month: currentMonth,
    status: 'active',
  })
    .sort({ amount: -1 })
    .populate('user');

  if (!highestBid) {
    if (strict) {
      throw createHttpError(404, 'No active bids found for this month');
    }

    return null;
  }

  if (!highestBid.user) {
    if (strict) {
      throw createHttpError(500, 'Invalid bid: user not found');
    }

    return null;
  }

  const profile = await Profile.findOne({ user: highestBid.user._id });
  if (!profile) {
    if (strict) {
      throw createHttpError(404, `Profile not found for highest bidder (${highestBid.user.email})`);
    }

    return null;
  }

  const { activeMonthWins, allowedWins } = getAllowedWinsForMonth(profile, winnerMonth);

  if (activeMonthWins >= allowedWins) {
    if (strict) {
      throw createHttpError(
        400,
        `User has reached monthly win limit of ${allowedWins} wins in ${winnerMonth}`,
        {
          monthlyWins: activeMonthWins,
          lastWinMonth: profile.lastWinMonth,
          allowedWins,
        },
      );
    }

    return null;
  }

  const winner = await Winner.create({
    user: highestBid.user._id,
    profile: profile._id,
    bid: highestBid._id,
    amount: highestBid.amount,
    date: targetDate,
    month: winnerMonth,
  });

  highestBid.status = 'won';
  await highestBid.save();

  profile.monthlyWins += 1;
  profile.lastWinMonth = winnerMonth;
  await profile.save();

  await Bid.updateMany(
    {
      month: currentMonth,
      status: 'active',
      _id: { $ne: highestBid._id },
    },
    { status: 'lost' },
  );

  return {
    dateLabel,
    winner,
  };
};

module.exports = {
  getAllowedWinsForMonth,
  getTargetDate,
  selectWinnerForDate,
};