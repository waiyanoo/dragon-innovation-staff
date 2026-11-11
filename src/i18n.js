import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      language: { english: "English", myanmar: "Myanmar", change: "Change language" },
      navigation: {
        dashboard: "Dashboard", profile: "Profile", reward: "Reward", order: "Order",
        warehouseQueue: "Warehouse Queue", orderRecords: "Order Records", retail: "Retail",
        wholesale: "Wholesale", admin: "For Admin", summary: "Summary",
        statistics: "Statistics", adminTools: "Admin Tools", staffPortal: "Staff Portal",
      },
      actions: {
        view: "View", edit: "Edit", save: "Save", cancel: "Cancel", close: "Close",
        signOut: "Sign out", openNavigation: "Open navigation", closeNavigation: "Close navigation",
      },
      fulfilment: { pending: "Pending", packed: "Packed", shipped: "Shipped", cancelled: "Cancelled" },
      invoiceStatus: { not_required: "Not required", requested: "Requested", draft: "Draft", issued: "Issued" },
      paymentStatus: { COD: "COD", Paid: "Paid", Partial: "Partial", Other: "Other", Unpaid: "Unpaid" },
      paymentMethod: { Cash: "Cash", KPay: "KPay", Bank: "Bank", NoPay: "Not paid", Other: "Other" },
      orderActions: { view: "View", waybill: "Print waybill", adhoc_invoice: "Create ad-hoc invoice", edit: "Edit", packed: "Mark as packed", shipped: "Mark as shipped", invoice: "Set official invoice no.", exception: "Report fulfilment issue", cancel: "Cancel order" },
      common: { home: "Home", loadingPage: "Loading page…" },
    },
  },
  my: {
    translation: {
      language: { english: "အင်္ဂလိပ်", myanmar: "မြန်မာ", change: "ဘာသာစကား ပြောင်းရန်" },
      navigation: {
        dashboard: "ပင်မစာမျက်နှာ", profile: "ကိုယ်ရေးအချက်အလက်", reward: "ဆုကြေး",
        order: "အော်ဒါအသစ်", warehouseQueue: "ဂိုဒေါင်လုပ်ငန်းစာရင်း",
        orderRecords: "အော်ဒါမှတ်တမ်းများ", retail: "လက်လီ", wholesale: "လက်ကား",
        admin: "စီမံခန့်ခွဲမှု", summary: "အနှစ်ချုပ်", statistics: "စာရင်းအင်း",
        adminTools: "စီမံခန့်ခွဲရေးကိရိယာများ", staffPortal: "ဝန်ထမ်းစနစ်",
      },
      actions: {
        view: "ကြည့်ရန်", edit: "ပြင်ဆင်ရန်", save: "သိမ်းရန်", cancel: "ပယ်ဖျက်ရန်",
        close: "ပိတ်ရန်", signOut: "ထွက်ရန်", openNavigation: "မီနူးဖွင့်ရန်", closeNavigation: "မီနူးပိတ်ရန်",
      },
      fulfilment: { pending: "ထုပ်ပိုးရန်", packed: "ထုပ်ပိုးပြီး", shipped: "ပို့ဆောင်ပြီး", cancelled: "ပယ်ဖျက်ပြီး" },
      invoiceStatus: { not_required: "မလိုအပ်ပါ", requested: "တောင်းခံထားသည်", draft: "မူကြမ်း", issued: "ထုတ်ပေးပြီး" },
      paymentStatus: { COD: "ပစ္စည်းရောက်ငွေချေ", Paid: "ငွေချေပြီး", Partial: "တစ်စိတ်တစ်ပိုင်းချေပြီး", Other: "အခြား", Unpaid: "ငွေမချေရသေး" },
      paymentMethod: { Cash: "ငွေသား", KPay: "KPay", Bank: "ဘဏ်လွှဲ", NoPay: "ငွေမချေရသေး", Other: "အခြား" },
      orderActions: { view: "ကြည့်ရန်", waybill: "ပို့ဆောင်ရေးစာရွက် ပုံနှိပ်ရန်", adhoc_invoice: "ယာယီငွေတောင်းခံလွှာ ပြုလုပ်ရန်", edit: "ပြင်ဆင်ရန်", packed: "ထုပ်ပိုးပြီးအဖြစ် သတ်မှတ်ရန်", shipped: "ပို့ဆောင်ပြီးအဖြစ် သတ်မှတ်ရန်", invoice: "ငွေတောင်းခံလွှာအမှတ် ထည့်ရန်", exception: "ဂိုဒေါင်ပြဿနာ တင်ပြရန်", cancel: "အော်ဒါပယ်ဖျက်ရန်" },
      common: { home: "ပင်မ", loadingPage: "စာမျက်နှာ ဖွင့်နေသည်…" },
    },
  },
};

const savedLanguage = localStorage.getItem("portalLanguage");
const initialLanguage = savedLanguage === "my" ? "my" : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false,
});

i18n.on("languageChanged", (language) => {
  localStorage.setItem("portalLanguage", language);
  document.documentElement.lang = language;
});

document.documentElement.lang = initialLanguage;

export default i18n;
