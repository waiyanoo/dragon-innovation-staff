export const TimestampDisplay = (timestamp) => {
  const date = timestamp.toDate();
  return <p>{date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}</p>;
};

export const formattedAmount = (value) => {
  return new Intl.NumberFormat("en-MM", {
    style: "currency",
    currency: "MMK",
  }).format(value);
};

export const getOrderAmountByType = (hanskinOrder, sugarBearOrder, mongdiesOrder) => {
  const hanskinTotal = (hanskinOrder && hanskinOrder.length > 0) ? hanskinOrder.reduce((sum, item) => sum + ((+item.amount || 0)-(+item.deliveryFees || 0)), 0) : 0;
  const sugarBearTotal = (sugarBearOrder && sugarBearOrder.length > 0) ? sugarBearOrder.reduce((sum, item) => sum + ((+item.amount || 0)-(+item.deliveryFees || 0)), 0) : 0;
  const mongdiesTotal = (mongdiesOrder && mongdiesOrder.length > 0) ? mongdiesOrder.reduce((sum, item) => sum + ((+item.amount || 0)-(+item.deliveryFees || 0)), 0) : 0;

  return { hanskinTotal, sugarBearTotal, mongdiesTotal };
}

export const getOrderByType = (orders) => {
  const hanskinOrder = orders.filter(order => order.brand === 'hanskin');
  const sugarBearOrder = orders.filter(order => order.brand === 'sugarbear');
  const mongdiesOrder = orders.filter(order => order.brand === 'mongdies')

  return {hanskinOrder, sugarBearOrder, mongdiesOrder};
}

export const calculateForChart = (data, label) => {
  const result = {};
  const now = new Date();
  data.forEach(item => {
    const date = item.createdAt.toDate(); // convert Firestore Timestamp
    const month = date.toLocaleString("default", { month: "short" }); // e.g., "May 2025"

    if (!result[month]) result[month] = 0;
    result[month] += +item.amount || 0;
  });

  const months = [...Array(6)].map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i);
    return d.toLocaleString("default", { month: "short" });
  });

  return {labels : months, datasets : {label, data: months.map(m => (  result[m] || 0))}}
}
