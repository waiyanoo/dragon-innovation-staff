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