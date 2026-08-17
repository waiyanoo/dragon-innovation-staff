// Aggregation helpers for the statistics page.
//
// "Sales" throughout means amount minus deliveryFees, matching how the
// dashboard and reward pages compute brand totals, so figures reconcile
// across pages.

import { canonicalCity } from "../../data/cityList";
import { normalizeMyanmarPhone } from "../../functions/phone";

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

// Orders belong to the same customer when any normalized primary/secondary
// phone or normalized Facebook name overlaps. This is intentionally broader
// than duplicate-order protection: the report is meant to reconnect a
// customer's historical orders even when they use another saved phone field.
export const groupRepeatCustomers = (orders) => {
  const parent = orders.map((_, index) => index);
  const find = (index) => {
    if (parent[index] !== index) parent[index] = find(parent[index]);
    return parent[index];
  };
  const union = (left, right) => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parent[rightRoot] = leftRoot;
  };

  const identityOwner = new Map();
  const identifiedOrders = new Set();

  orders.forEach((order, index) => {
    const phones = [order.primaryPhone, order.secondaryPhone]
      .map(normalizeMyanmarPhone)
      .filter(Boolean);
    const name = collapseSpace(order.name).toLowerCase();
    const identities = [
      ...new Set(phones.map((phone) => `phone:${phone}`)),
      ...(name ? [`name:${name}`] : []),
    ];

    if (identities.length === 0) return;
    identifiedOrders.add(index);
    identities.forEach((identity) => {
      if (identityOwner.has(identity)) union(index, identityOwner.get(identity));
      else identityOwner.set(identity, index);
    });
  });

  const customers = new Map();
  orders.forEach((order, index) => {
    if (!identifiedOrders.has(index)) return;
    const root = find(index);
    const existing = customers.get(root) || {
      phones: new Set(),
      names: new Map(),
      brands: new Set(),
      orderRecords: [],
      orders: 0,
      sales: 0,
      lastOrderAt: null,
    };

    [order.primaryPhone, order.secondaryPhone]
      .map(normalizeMyanmarPhone)
      .filter(Boolean)
      .forEach((phone) => existing.phones.add(phone));

    const name = collapseSpace(order.name);
    if (name && !existing.names.has(name.toLowerCase())) {
      existing.names.set(name.toLowerCase(), name);
    }
    if (order.brand) existing.brands.add(order.brand);
    existing.orderRecords.push(order);
    existing.orders += 1;
    existing.sales += netSales(order);

    const createdAt = order.createdAt?.toDate?.() || null;
    if (createdAt && (!existing.lastOrderAt || createdAt > existing.lastOrderAt)) {
      existing.lastOrderAt = createdAt;
    }
    customers.set(root, existing);
  });

  const allCustomers = [...customers.values()];
  const repeated = allCustomers
    .filter((customer) => customer.orders >= 2)
    .map((customer) => ({
      ...customer,
      phone: [...customer.phones].join(" / "),
      names: [...customer.names.values()],
      brands: [...customer.brands],
      averageOrder: customer.sales / customer.orders,
    }))
    .sort((a, b) => b.orders - a.orders || b.sales - a.sales);

  return {
    customers: repeated,
    uniqueCustomers: allCustomers.length,
    repeatCustomerCount: repeated.length,
    repeatOrders: repeated.reduce((sum, customer) => sum + customer.orders, 0),
    repeatSales: repeated.reduce((sum, customer) => sum + customer.sales, 0),
  };
};
