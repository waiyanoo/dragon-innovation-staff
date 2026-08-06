// Aggregation helpers for the statistics page.
//
// "Sales" throughout means amount minus deliveryFees, matching how the
// dashboard and reward pages compute brand totals, so figures reconcile
// across pages.

import { canonicalCity } from "../../data/cityList";

export const UNSPECIFIED = "(Not specified)";

const collapseSpace = (value) => String(value || "").trim().replace(/\s+/g, " ");

export const netSales = (order) => (+order.amount || 0) - (+order.deliveryFees || 0);

/**
 * Group orders by a text field, returning rows sorted by order count.
 *
 * City has always been typed by hand, so orders predating the picker hold
 * spellings like "ygn" or "hpa an". `canonicalise` maps each value onto the
 * curated city list — collapsing case, punctuation and known aliases — so
 * historical rows group with newly picked ones. Unrecognised places are kept
 * (tidied) rather than dropped. State comes from a fixed Select and is shown
 * as stored.
 */
export const groupByField = (orders, field, { canonicalise = false } = {}) => {
  const buckets = new Map();

  orders.forEach((order) => {
    const raw = canonicalise
      ? canonicalCity(order[field]) || ""
      : collapseSpace(order[field]);
    const key = raw ? raw.toLowerCase() : "";
    const existing = buckets.get(key);

    if (existing) {
      existing.orders += 1;
      existing.sales += netSales(order);
      existing.deliveryFees += +order.deliveryFees || 0;
      return;
    }

    buckets.set(key, {
      key: key || "__unspecified__",
      label: raw || UNSPECIFIED,
      orders: 1,
      sales: netSales(order),
      deliveryFees: +order.deliveryFees || 0,
    });
  });

  return [...buckets.values()].sort((a, b) => b.orders - a.orders || b.sales - a.sales);
};

export const summarise = (orders) => {
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, order) => sum + netSales(order), 0);
  const totalDelivery = orders.reduce((sum, order) => sum + (+order.deliveryFees || 0), 0);

  return {
    totalOrders,
    totalSales,
    totalDelivery,
    averageOrder: totalOrders > 0 ? totalSales / totalOrders : 0,
  };
};

export const shareOf = (value, total) => (total > 0 ? (value / total) * 100 : 0);
