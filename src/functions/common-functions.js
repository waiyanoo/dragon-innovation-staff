import { Timestamp } from "firebase/firestore";

export const TimestampDisplay = (timestamp) => {
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formattedAmount = (value) => {
  return new Intl.NumberFormat("en-MM", {
    style: "currency",
    currency: "MMK",
  }).format(value);
};

export const getOrderAmountByType = (hanskinOrder, sugarBearOrder, mongdiesOrder) => {
  const hanskinTotal =
    hanskinOrder && hanskinOrder.length > 0
      ? hanskinOrder.reduce(
          (sum, item) => sum + ((+item.amount || 0) - (+item.deliveryFees || 0)),
          0
        )
      : 0;
  const sugarBearTotal =
    sugarBearOrder && sugarBearOrder.length > 0
      ? sugarBearOrder.reduce(
          (sum, item) => sum + ((+item.amount || 0) - (+item.deliveryFees || 0)),
          0
        )
      : 0;
  const mongdiesTotal =
    mongdiesOrder && mongdiesOrder.length > 0
      ? mongdiesOrder.reduce(
          (sum, item) => sum + ((+item.amount || 0) - (+item.deliveryFees || 0)),
          0
        )
      : 0;

  return { hanskinTotal, sugarBearTotal, mongdiesTotal };
};

export const getOrderByType = (orders) => {
  const hanskinOrder = orders.filter((order) => order.brand === "hanskin");
  const sugarBearOrder = orders.filter((order) => order.brand === "sugarbear");
  const mongdiesOrder = orders.filter((order) => order.brand === "mongdies");

  return { hanskinOrder, sugarBearOrder, mongdiesOrder };
};

export const calculateForChart = (data, label) => {
  const result = {};
  const now = new Date();
  data.forEach((item) => {
    const date = item.createdAt.toDate(); // convert Firestore Timestamp
    const month = date.toLocaleString("default", { month: "short" }); // e.g., "May 2025"

    if (!result[month]) result[month] = 0;
    result[month] += +item.amount || 0;
  });

  const months = [...Array(6)].map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i);
    return d.toLocaleString("default", { month: "short" });
  });

  return { labels: months, datasets: { label, data: months.map((m) => result[m] || 0) } };
};

const toTimestamp = (date) => Timestamp.fromDate(date);

export const getDateRanges = () => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const startOfPrevQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
  const startOfThisYear = new Date(now.getFullYear(), 0, 1);
  const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);

  const startOfPrevYear = new Date(now.getFullYear() - 1, 0, 1);

  return {
    thisMonth: {
      start: toTimestamp(startOfThisMonth),
      end: toTimestamp(startOfNextMonth),
    },
    previousMonth: {
      start: toTimestamp(startOfPrevMonth),
      end: toTimestamp(startOfThisMonth),
    },
    previousQuarter: {
      start: toTimestamp(startOfPrevQuarter),
      end: toTimestamp(startOfThisMonth),
    },
    thisYear: {
      start: toTimestamp(startOfThisYear),
      end: toTimestamp(startOfNextYear),
    },
    previousYear: {
      start: toTimestamp(startOfPrevYear),
      end: toTimestamp(startOfThisYear),
    },
  };
};

export const getPreviousMonthID = () => {
  const now = new Date();

  // Compute the previous month
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth(); // 1-12

  return `${year}_${month.toString().padStart(2, "0")}`
}

export const calculateCommissionEach = (amount, targets) => {
  if(amount < targets.level1.amount){
    return {
      commissions : 0,
      target : (amount / targets.level1.amount) * 100,
    }
  } else {
    const percentage = amount > targets.level3.amount ? targets.level3.commission
      : amount > targets.level2.amount ? targets.level2.commission
        : targets.level1.commission;

    return {
      commissions : (  percentage / 100) * amount,
      target : 100,
    }
  }
}
