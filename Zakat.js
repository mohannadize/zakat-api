const axios = require("axios");
const { goldapi } = require("./config");
const fs = require("fs");

const CACHE_FILE = `./${process.env.CACHE_FILE}` || "./cache.json";
const { DEFAULT_CURRENCY = "USD", UPDATE_INTERVAL = 90 } = process.env;

const getTimeOffsetInSeconds = (time = new Date().toISOString()) => {
  const timeOffset = Math.floor(
    (new Date().getTime() - new Date(time).getTime()) / 1000
  );
  return timeOffset;
};

module.exports = class Zakat {
  currency;
  goldPrice;
  silverPrice;
  zakatGold;
  zakatSilver;
  lastUpdated;
  cache;

  constructor(currency = DEFAULT_CURRENCY) {
    this.currency = currency.toUpperCase();
    return (async () => {
      let currencyCache = {
        goldPrice: 0,
        silverPrice: 0,
        lastUpdated: new Date("2012-12-21").toISOString(),
      };
      let cache = {
        [this.currency]: currencyCache,
      };
      try {
        cache = fs.readFileSync(CACHE_FILE);
        cache = JSON.parse(cache);
        cache = {
          ...cache,
          [this.currency]: {
            ...currencyCache,
            ...(cache[this.currency] || {}),
          },
        };
      } catch (err) {}
      for (let key in cache[this.currency]) {
        this[key] = cache[this.currency][key];
      }
      this.cache = cache;
      await this.updatePrices();
      await this.calculateZakat();
      return this;
    })();
  }

  async updateCache() {
    const currecyCache = {
      goldPrice: this.goldPrice,
      silverPrice: this.silverPrice,
      lastUpdated: this.lastUpdated,
    };
    const cache = {
      ...this.cache,
      [this.currency]: currecyCache,
    };
    return fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, undefined, 2));
  }

  async getGoldPrice() {
    /* 
   
  Response Example: 
    {
      "timestamp": 1639075736,
      "metal": "XAU",
      "currency": "EGP",
      "exchange": "GOLDAPI",
      "symbol": "GOLDAPI:XAUEGP",
      "open_time": 1639008000,
      "price": 27810.5195, <-- price of 31.1035 grams of gold withpurity (100%)
      "ch": -93.274,
      "ask": 27815.684,
      "bid": 27804.5725
    }
   */
    if (getTimeOffsetInSeconds(this.lastUpdated) < UPDATE_INTERVAL * 60)
      return this;

    const { data } = await axios.get(
      `${goldapi.endpoint}/XAU/${this.currency}`,
      {
        headers: {
          "x-access-token": goldapi.api_key,
          "content-type": "application/json",
        },
      }
    );

    // Carat 21 Price (87.5% Purity) - 1 gram
    let carat21price = (data.price / 31.1035) * 0.875;

    this.goldPrice = Math.round((carat21price + Number.EPSILON) * 100) / 100;
    this.lastUpdated = new Date().toISOString();

    return this;
  }

  async getSilverPrice() {
    /**
   * 
   
  Response Example: 
    {
      "timestamp": 1639075736,
      "metal": "XAG",
      "currency": "EGP",
      "exchange": "GOLDAPI",
      "symbol": "GOLDAPI:XAGEGP",
      "open_time": 1639008000,
      "price": 27810.5195, <-- price of 31.1035 grams of gold withpurity (100%)
      "ch": -93.274,
      "ask": 27815.684,
      "bid": 27804.5725
    }
   */
    if (getTimeOffsetInSeconds(this.lastUpdated) < UPDATE_INTERVAL * 60)
      return this;
    const { data } = await axios.get(
      `${goldapi.endpoint}/XAG/${this.currency}`,
      {
        headers: {
          "x-access-token": goldapi.api_key,
          "content-type": "application/json",
        },
      }
    );

    let processed_price = data.price / 31.1035;
    processed_price =
      Math.round((processed_price + Number.EPSILON) * 100) / 100;

    this.silverPrice = processed_price;
    this.lastUpdated = new Date().toISOString();

    return this;
  }

  async updatePrices() {
    await Promise.all([this.getSilverPrice(), this.getGoldPrice()]);
    this.updateCache();
    return this;
  }

  async calculateZakat() {
    const minGold = this.goldPrice * 85;
    const minSilver = this.silverPrice * 595;

    this.zakatGold = Math.round((minGold + Number.EPSILON) * 100) / 100;
    this.zakatSilver = Math.round((minSilver + Number.EPSILON) * 100) / 100;

    return this;
  }

  async getZakat() {
    return {
      zakatGold: this.zakatGold,
      zakatSilver: this.zakatSilver,
      goldPrice: this.goldPrice,
      silverPrice: this.silverPrice,
      currency: this.currency,
      lastUpdated: this.lastUpdated,
    };
  }
};
