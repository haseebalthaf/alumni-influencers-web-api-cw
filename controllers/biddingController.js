const Bid = require('../models/Bid');
const Profile = require('../models/Profile');
const Winner = require('../models/Winner');

const getBidStatus = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Get user's current active bid
    const currentBid = await Bid.findOne({
      user: req.user._id,
      month: currentMonth,
      status: 'active'
    }).sort({ date: -1 });

    // Get highest bid (blind bidding)
    const highestBid = await Bid.findOne({
      month: currentMonth,
      status: 'active'
    }).sort({ amount: -1 });

    // Get user's profile for monthly wins
    const profile = await Profile.findOne({ user: req.user._id });

    let isWinning = false;
    if (currentBid && highestBid) {
      isWinning = currentBid.amount >= highestBid.amount;
    }

    const activeMonthWins = profile && profile.lastWinMonth === currentMonth ? profile.monthlyWins : 0;
    const extraWin = profile && profile.eventParticipationMonth === currentMonth ? 1 : 0;
    const allowedWins = 3 + extraWin;
    const remainingSlots = Math.max(0, allowedWins - activeMonthWins);
    const sponsorshipBudget = profile && Array.isArray(profile.sponsorshipOffers)
      ? profile.sponsorshipOffers.reduce((sum, offer) => sum + (offer.amount || 0), 0)
      : 0;

    res.json({
      currentBid: currentBid ? currentBid.amount : 0,
      isWinning,
      monthlyWins: activeMonthWins,
      allowedWins,
      remainingSlots,
      canBid: remainingSlots > 0,
      sponsorshipBudget,
      sponsorshipOffers: profile ? profile.sponsorshipOffers : []
    });
  } catch (error) {
    console.error('Get bid status error:', error);
    res.status(500).json({ message: 'Server error while retrieving bid status', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Bid amount must be a positive number' });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    // Get user profile
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found. Please create a profile first.' });
    }

    const activeMonthWins = profile.lastWinMonth === currentMonth ? profile.monthlyWins : 0;
    const extraWin = profile.eventParticipationMonth === currentMonth ? 1 : 0;
    const allowedWins = 3 + extraWin;

    if (activeMonthWins >= allowedWins) {
      return res.status(400).json({ message: `You have reached your monthly bid limit (${allowedWins} wins) for this month` });
    }

    const sponsorshipBudget = Array.isArray(profile.sponsorshipOffers)
      ? profile.sponsorshipOffers.reduce((sum, offer) => sum + (offer.amount || 0), 0)
      : 0;

    if (sponsorshipBudget > 0 && amount > sponsorshipBudget) {
      return res.status(400).json({ message: `Bid amount cannot exceed available sponsorship budget (£${sponsorshipBudget})` });
    }

    // Get current active bid
    let bid = await Bid.findOne({
      user: req.user._id,
      month: currentMonth,
      status: 'active'
    });

    if (bid) {
      // Update existing bid (only increase allowed)
      if (amount <= bid.amount) {
        return res.status(400).json({ message: `New bid amount (${amount}) must be higher than current bid (${bid.amount})` });
      }
      bid.amount = amount;
      bid.date = new Date();
    } else {
      // Create new bid
      bid = new Bid({
        user: req.user._id,
        amount,
        month: currentMonth
      });
    }

    await bid.save();

    res.json({ message: 'Bid placed successfully', bid: bid.amount });
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({ message: 'Server error while placing bid', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

const getTodayWinner = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const winner = await Winner.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('profile');

    if (!winner) {
      return res.status(404).json({ message: 'No winner selected for today' });
    }

    res.json({
      winner: {
        name: `${winner.profile.personalInfo.firstName} ${winner.profile.personalInfo.lastName}`,
        biography: winner.profile.personalInfo.biography,
        linkedInUrl: winner.profile.linkedInUrl,
        profileImage: winner.profile.profileImage,
        degrees: winner.profile.degrees,
        certifications: winner.profile.certifications,
        licences: winner.profile.licences,
        courses: winner.profile.courses,
        employmentHistory: winner.profile.employmentHistory
      },
      bidAmount: winner.amount
    });
  } catch (error) {
    console.error('Get today winner error:', error);
    res.status(500).json({ message: 'Server error while retrieving today\'s winner', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

const getTomorrowSlot = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);

    const winner = await Winner.findOne({
      date: {
        $gte: tomorrow,
        $lt: nextDay
      }
    }).populate('profile');

    if (!winner) {
      return res.status(404).json({ message: 'No slot selected for tomorrow yet' });
    }

    res.json({
      winner: {
        name: `${winner.profile.personalInfo.firstName} ${winner.profile.personalInfo.lastName}`,
        biography: winner.profile.personalInfo.biography,
        linkedInUrl: winner.profile.linkedInUrl,
        profileImage: winner.profile.profileImage
      }
    });
  } catch (error) {
    console.error('Get tomorrow slot error:', error);
    res.status(500).json({ message: 'Server error while retrieving tomorrow slot', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

const getBidHistory = async (req, res) => {
  try {
    const history = await Bid.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ history });
  } catch (error) {
    console.error('Get bid history error:', error);
    res.status(500).json({ message: 'Server error while retrieving bid history', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

const cancelBid = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const bid = await Bid.findOne({
      user: req.user._id,
      month: currentMonth,
      status: 'active'
    });

    if (!bid) {
      return res.status(404).json({ message: 'No active bid found for current month' });
    }

    bid.status = 'lost';
    await bid.save();

    res.json({ message: 'Bid cancelled successfully' });
  } catch (error) {
    console.error('Cancel bid error:', error);
    res.status(500).json({ message: 'Server error while cancelling bid', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

module.exports = {
  getBidStatus,
  placeBid,
  getTodayWinner,
  getTomorrowSlot,
  getBidHistory,
  cancelBid
};