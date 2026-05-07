const cron = require("node-cron");

const { selectWinnerForDate } = require("./winnerService");

let schedulerStarted = false;

const scheduleWinnerSelection = () => {
  if (schedulerStarted) {
    return;
  }

  schedulerStarted = true;

  cron.schedule(
    "0 18 * * *",
    async () => {
      console.log("Running scheduled winner selection...");

      try {
        const result = await selectWinnerForDate({ strict: false });

        if (!result) {
          console.log("No winner selected during scheduled run.");
          return;
        }

        console.log(`Winner selected successfully for ${result.dateLabel}.`);
      } catch (error) {
        console.error("Error in scheduled winner selection:", error);
      }
    },
    {
      timezone: "UTC",
    },
  );
};

module.exports = {
  scheduleWinnerSelection,
};
