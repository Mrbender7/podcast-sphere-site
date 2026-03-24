// Web-only stub — no native billing on website
const BillingPlugin = {
  queryPurchases: async () => ({ isPremium: false }),
  purchasePremium: async () => ({ purchased: false }),
  restorePurchases: async () => ({ isPremium: false }),
};

export default BillingPlugin;
