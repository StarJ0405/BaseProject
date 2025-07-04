import axios from "axios";
import { languages } from "lang/i18n";
import { Cookies as ReactCookies } from "react-cookie";
import { Cookies, dataToQuery, getCookieOption } from "./utils/Utils";
const mode = process.env.REACT_APP_MODE;

const origin = mode
  ? process.env["REACT_APP_ORIGIN_" + mode.toUpperCase()] ||
    process.env.REACT_APP_ORIGIN
  : process.env.REACT_APP_ORIGIN;

class AdminRequester {
  instance = null;
  constructor() {
    axios.defaults.withCredentials = true;
    this.instance = axios.create({
      baseURL: `${origin}/admin`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      origin: `${origin}`,
      withCredentials: true,
    });

    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (
          error.response.status === 401 &&
          error.response.data === "Unauthorized"
        ) {
          const isAdmin = window.location.pathname.includes("admin");
          const code = new ReactCookies().get(Cookies.LANG, getCookieOption());
          const find = languages.find((language) => language.code === code);
          if (!find) {
            window.location.href = "/";
            return;
          }
          const lang = find.flag;
          if (
            window.location.pathname !==
            (isAdmin ? `/${lang}/admin/login` : `/${lang}/vendor/login`)
          )
            window.location.href = isAdmin
              ? `/${lang}/admin/login`
              : `/${lang}/vendor/login`;
        }
        return Promise.reject(error);
      }
    );
    this.instance.interceptors.request.use(
      (config) => {
        const jwt = new ReactCookies().get(Cookies.JWT, getCookieOption());
        if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
        return config;
      },
      async (error) => {
        return Promise.reject(error);
      }
    );
  }

  async get(url, data) {
    let instance = this.instance;
    let result = "";
    let params = "?" + dataToQuery(data);

    try {
      return new Promise(function (resolve, reject) {
        instance
          .get(url + params)
          .then((res) => {
            result = res.data;
          })
          .catch((error) => {
            if (error.response) {
              result = error.response.data;
              // 요청이 이루어졌으며 서버가 2xx의 범위를 벗어나는 상태 코드로 응답했습니다.
              // if (error.response.status === 401) {
              //   // invalid token
              //   result.code = error.response.status;
              // } else {
              // }
            } else if (error.request) {
              // 요청이 이루어 졌으나 응답을 받지 못했습니다.
              // `error.request`는 브라우저의 XMLHttpRequest 인스턴스 또는
              // Node.js의 http.ClientRequest 인스턴스입니다.
            } else {
              // 오류를 발생시킨 요청을 설정하는 중에 문제가 발생했습니다.
            }
          })
          .finally(() => {
            resolve(result);
          });
      });
    } catch (e) {}
  }
  async delete(url, data) {
    let instance = this.instance;
    let result = "";
    let params = "?" + new URLSearchParams(data).toString();
    try {
      return new Promise(function (resolve, reject) {
        instance
          .delete(url + params)
          .then((res) => {
            result = res.data;
          })
          .catch((error) => {
            if (error.response) {
              result = error.response.data;
              if (
                error.response.status === 401 &&
                error.response.data === "Unauthorized"
              ) {
                const isAdmin = window.location.pathname.includes("admin");
                const [, flagCode] = window.ocation.pathname.split("/");
                if (
                  window.location.pathname !==
                  (isAdmin
                    ? `/${flagCode}/admin/login`
                    : `/${flagCode}/vendor/login`)
                )
                  window.location.href = isAdmin
                    ? `/${flagCode}/admin/login`
                    : `/${flagCode}/vendor/login`;
              }
            } else if (error.request) {
              // 요청이 이루어 졌으나 응답을 받지 못했습니다.
              // `error.request`는 브라우저의 XMLHttpRequest 인스턴스 또는
              // Node.js의 http.ClientRequest 인스턴스입니다.
            } else {
              // 오류를 발생시킨 요청을 설정하는 중에 문제가 발생했습니다.
            }
          })
          .finally(() => {
            resolve(result);
          });
      });
    } catch (e) {}
  }

  async post(url, data) {
    let instance = this.instance;
    let result = "";
    try {
      return new Promise(function (resolve, reject) {
        instance
          .post(url, JSON.stringify(data))
          .then((res) => {
            result = res.data;
          })
          .catch((error) => {
            if (error.response) {
              result = error.response.data;
              // if (error.response.status === 401) {
              //   // invalid token
              //   result.code = error.response.status;
              // } else {
              // }
            } else if (error.request) {
            } else {
            }
          })
          .finally(() => {
            resolve(result);
          });
      });
    } catch (e) {}
  }
  async Login(data, callback) {
    callback(await this.post(`auth`, data));
  }
  // user
  async getCurrentUser(callback) {
    callback(await this.get(`auth`));
  }
  async getUsers(data, callback) {
    if (callback) callback(await this.get(`users`, data));
    else return await this.get(`users`, data);
  }
  async createUser(data, callback) {
    if (callback) callback(await this.post(`users`, data));
    else return await this.post(`users`, data);
  }
  async updateUser(id, data, callback) {
    if (callback) callback(await this.post(`users/${id}`, data));
    else return await this.post(`users/${id}`, data);
  }
  async isExistUserEmail(email, callback) {
    if (callback) callback(await this.get(`users/email/${email}`));
    else return await this.get(`users/email/${email}`);
  }
  async isExistEmail(email, callback) {
    if (callback) callback(await this.get(`/auth/${email}`));
    else return await this.get(`/auth/${email}`);
  }
  // store
  async getStores(data, callback) {
    if (callback) callback(await this.get(`stores`, data));
    else return await this.get(`stores`, data);
  }
  async getStore(id, data, callback) {
    if (callback) callback(await this.get(`stores/${id}`, data));
    else return await this.get(`stores/${id}`, data);
  }
  async getStoresStatus(data, callback) {
    if (callback) callback(await this.get(`stores/status`, data));
    else return await this.get(`stores/status`, data);
  }
  async createStore(data, callback) {
    if (callback) callback(await this.post(`stores`, data));
    else return await this.post(`stores`, data);
  }
  async updateStore(id, data, callback) {
    if (callback) callback(await this.post(`stores/${id}`, data));
    else return await this.post(`stores/${id}`, data);
  }
  async deleteStore(id, data, callback) {
    if (callback) callback(await this.delete(`stores/${id}`, data));
    else return await this.delete(`stores/${id}`, data);
  }

  // 주문서
  async getOrders(data, callback) {
    if (callback) callback(await this.get(`orders`, data));
    else return await this.get(`orders`, data);
  }
  async getOrder(id, data, callback) {
    if (callback) callback(await this.get(`orders/${id}`, data));
    else return await this.get(`orders/${id}`, data);
  }
  async cancelOrder(id, data, callback) {
    if (callback) callback(await this.post(`orders/${id}/cancel`, data));
    else return await this.post(`orders/${id}/cancel`, data);
  }
  async getOrderStatus(data, callback) {
    if (callback) callback(await this.get(`orders/status`, data));
    else return await this.get(`orders/status`, data);
  }
  async getCustomerOrderStatus(id, data, callback) {
    if (callback) callback(await this.get(`customers/${id}/orders`, data));
    else return await this.get(`customers/${id}/orders`, data);
  }
  async createFulfillment(id, data, callback) {
    if (callback) callback(await this.post(`orders/${id}/fulfillment`, data));
    else return await this.post(`orders/${id}/fulfillment`, data);
  }
  async shipFulfillment(id, data, callback) {
    callback(await this.post(`orders/${id}/shipment`, data));
  }
  async updateOrderStatus(id, data, callback) {
    if (callback) callback(await this.post(`orders/${id}/status`, data));
    else return await this.post(`orders/${id}/status`, data);
  }
  async editOrder(orderId, data, callback) {
    if (callback) callback(await this.post(`orders/${orderId}/edit`, data));
    else return await this.post(`orders/${orderId}/edit`, data);
  }
  async Logout(callback) {
    callback(await this.delete(`auth`));
  }
  async getStatistic(data, callback) {
    if (callback) callback(await this.get(`statistic`, data));
    else return await this.get(`statistic`, data);
  }
  async getLayout(data, callback) {
    callback(await this.get(`layout`, data));
  }
  async postLayout(data, callback) {
    if (callback) callback(await this.post(`layout`, data));
    else return await this.post(`layout`, data);
  }
  async deleteLayout(data, callback) {
    if (callback) callback(await this.delete(`layout`, data));
    else return await this.delete(`layout`, data);
  }
  async getProducts(data, callback) {
    if (callback) callback(await this.get(`products`, data));
    else return await this.get(`products`, data);
  }
  async getProduct(id, data, callback) {
    if (callback) callback(await this.get(`products/${id}`, data));
    else return await this.get(`products/${id}`, data);
  }
  async getProductStatus(id, data, callback) {
    if (callback) callback(await this.get(`products/${id}/status`, data));
    else return await this.get(`products/${id}/status`, data);
  }
  async getProductsStatus(data, callback) {
    if (callback) callback(await this.get(`products/status`, data));
    else return await this.get(`products/status`, data);
  }
  async postProduct(data, callback) {
    if (callback) callback(await this.post(`products`, data));
    return await this.post(`products`, data);
  }
  async updateProduct(id, data, callback) {
    if (callback) callback(await this.post(`products/${id}`, data));
    else return await this.post(`products/${id}`, data);
  }
  async deleteProduct(id, callback) {
    if (callback) callback(await this.delete(`products/${id}`));
    else return await this.delete(`products/${id}`);
  }
  async postProductOption(id, data, callback) {
    if (callback) callback(await this.post(`products/${id}/options`, data));
    else return await this.post(`products/${id}/options`, data);
  }
  async deleteProductOption(id, option_id, data, callback) {
    if (callback)
      callback(await this.delete(`products/${id}/options/${option_id}`, data));
    else return await this.delete(`products/${id}/options/${option_id}`, data);
  }
  async postVariants(id, data, callback) {
    if (callback) callback(await this.post(`products/${id}/variants`, data));
    else return await this.post(`products/${id}/variants`, data);
  }
  async updateVariants(product_id, data, callback) {
    if (callback)
      callback(await this.post(`products/${product_id}/variants/status`, data));
    else return await this.post(`products/${product_id}/variants/status`, data);
  }
  async updateVariant(product_id, variant_id, data, callback) {
    if (callback)
      callback(
        await this.post(`products/${product_id}/variants/${variant_id}`, data)
      );
    else
      return await this.post(
        `products/${product_id}/variants/${variant_id}`,
        data
      );
  }
  async deleteVariant(id, variant_id, callback) {
    if (callback)
      callback(await this.delete(`products/${id}/variants/${variant_id}`));
    else return await this.delete(`products/${id}/variants/${variant_id}`);
  }
  async getVariantStatus(data, callback) {
    if (callback) callback(await this.get(`variants/status`, data));
    else return await this.get(`variants/status`, data);
  }
  async postVariantStatus(data, callback) {
    if (callback) callback(await this.post(`variants/status`, data));
    else return await this.post(`variants/status`, data);
  }
  async getVariants(data, callback) {
    if (callback) callback(await this.get(`variants`, data));
    else return await this.get(`variants`, data);
  }
  async getCategories(data, callback) {
    callback(await this.get(`product-categories`, data));
  }
  async postCategories(data, callback) {
    if (callback) callback(await this.post(`product-categories`, data));
    else return await this.post(`product-categories`, data);
  }
  async deleteCategory(id, callback) {
    if (callback) callback(await this.delete(`product-categories/${id}`));
    else return await this.delete(`product-categories/${id}`);
  }
  async updateCategory(id, data, callback) {
    if (callback) callback(await this.post(`product-categories/${id}`, data));
    else return await this.post(`product-categories/${id}`, data);
  }
  async getPromotionsStatus(data, callback) {
    if (callback) callback(await this.get(`promotions/status`, data));
    else return await this.get(`promotions/status`, data);
  }
  async editPromotionsStatus(data, callback) {
    if (callback) callback(await this.post(`promotions/status`, data));
    else return await this.post(`promotions/status`, data);
  }
  async postEvent(data, callback) {
    if (callback) callback(await this.post(`events`, data));
    else return await this.post(`events`, data);
  }
  async updateEvent(id, data, callback) {
    if (callback) callback(await this.post(`events/${id}`, data));
    else return await this.post(`events/${id}`, data);
  }
  async postDiscount(data, callback) {
    if (callback) callback(await this.post(`discounts`, data));
    else return await this.post(`discounts`, data);
  }
  async updateDiscount(id, data, callback) {
    if (callback) callback(await this.post(`discounts/${id}`, data));
    else return await this.post(`discounts/${id}`, data);
  }
  async updateDiscountCondition(id, condition_id, data, callback) {
    if (callback)
      callback(
        await this.post(
          `discounts/${id}/conditions/${condition_id}/batch`,
          data
        )
      );
    else
      return await this.post(
        `discounts/${id}/conditions/${condition_id}/batch`,
        data
      );
  }
  async getRegions(callback) {
    if (callback) callback(await this.get(`regions/status`, {}));
    else return await this.get(`regions/status`, {});
  }
  async getDiscountStatus(data, callback) {
    if (callback) callback(await this.get(`discounts/status`, data));
    else return await this.get(`discounts/status`, data);
  }
  async postDiscountStatus(data, callback) {
    if (callback) callback(await this.post(`discounts/status`, data));
    else return await this.post(`discounts/status`, data);
  }
  async getCustomerStatus(data, callback) {
    if (callback) callback(await this.get(`customers/status`, data));
    else return await this.get(`customers/status`, data);
  }
  async updateCustomer(id, data, callback) {
    if (callback) callback(await this.post(`customers/${id}`, data));
    else return await this.post(`customers/${id}`, data);
  }
  async getCustomerOrder(customer_id, data, callback) {
    if (callback)
      callback(await this.get(`customers/${customer_id}/orders`, data));
    else return await this.get(`customers/${customer_id}/orders`, data);
  }
  async getArticles(data, callback) {
    if (callback) callback(await this.get(`articles`, data));
    else return await this.get(`articles`, data);
  }
  async getArticleStatus(data, callback) {
    if (callback) callback(await this.get(`articles/status`, data));
    else return await this.get(`articles/status`, data);
  }
  async createArticle(data, callback) {
    if (callback) callback(await this.post(`articles`, data));
    else return await this.post(`articles`, data);
  }
  async updateArticle(id, data, callback) {
    if (callback) callback(await this.post(`articles/${id}`, data));
    else return await this.post(`articles/${id}`, data);
  }
  async deleteArticle(id, callback) {
    if (callback) callback(await this.delete(`articles/${id}`));
    else return await this.delete(`articles/${id}`);
  }
  async getBoards(data, callback) {
    if (callback) callback(await this.get(`boards`, data));
    else return await this.get(`boards`, data);
  }
  async isBoardExists(name, data, callback) {
    if (callback) callback(await this.get(`boards/exists/${name}`, data));
    else return await this.get(`boards/exists/${name}`, data);
  }
  async postBoardStatus(data, callback) {
    if (callback) callback(await this.post(`boards/status`, data));
    else return await this.get(`boards/status`, data);
  }
  async getLineItems(data, callback) {
    if (callback) callback(await this.get(`boards`, data));
    else return await this.get(`boards`, data);
  }
  async getChatrooms(data, callback) {
    if (callback) callback(await this.get(`chatroom`, data));
    else return await this.get(`chatroom`, data);
  }
  async createChatroom(data, callback) {
    if (callback) callback(await this.post(`chatroom`, data));
    else return await this.post(`chatroom`, data);
  }
  async getChatroomStatus(data, callback) {
    if (callback) callback(await this.get(`chatroom/status`, data));
    else return await this.get(`chatroom/status`, data);
  }
  async getChatroom(id, data, callback) {
    if (callback) callback(await this.get(`chatroom/${id}`, data));
    else return await this.get(`chatroom/${id}`, data);
  }
  async getChat(id, data, callback) {
    if (callback) callback(await this.get(`chatroom/${id}/chat`, data));
    else return await this.get(`chatroom/${id}/chat`, data);
  }
  async getLogs(data, callback) {
    if (callback) callback(await this.get(`logs`, data));
    else return await this.get(`logs`, data);
  }
  async getCustomerLogs(id, data, callback) {
    if (callback) callback(await this.get(`customers/${id}/logs/`, data));
    else return await this.get(`customers/${id}/logs/`, data);
  }
  async createLog(data, callback) {
    if (callback) callback(await this.post(`logs`, data));
    else return await this.post(`logs`, data);
  }
  async getFeeds(data, callback) {
    if (callback) callback(await this.get(`feeds`, data));
    else return await this.get(`feeds`, data);
  }

  async getFeedsStatus(data, callback) {
    if (callback) callback(await this.get(`feeds/status`, data));
    else return await this.get(`feeds/status`, data);
  }
  async createFeed(data, callback) {
    if (callback) callback(await this.post(`feeds`, data));
    else return await this.post(`feeds`, data);
  }

  async editFeed(id, data, callback) {
    if (callback) callback(await this.post(`feeds/${id}`, data));
    else return await this.post(`feeds/${id}`, data);
  }
  async deleteFeed(id, callback) {
    if (callback) callback(await this.delete(`feeds/${id}`));
    else return await this.delete(`feeds/${id}`);
  }
  async renewExchangeRate(callback) {
    if (callback) callback(await this.post("/exchange-rate/renew"));
    else return await this.post("/exchange-rate/renew");
  }
  async getExchangeRate(data, callback) {
    if (callback) callback(await this.get("/exchange-rate", data));
    else return await this.get("/exchange-rate", data);
  }
  async getComment(data, callback) {
    if (callback) callback(await this.get(`comments`, data));
    else return await this.get(`comments`, data);
  }
  async createComment(data, callback) {
    if (callback) callback(await this.post(`comments`, data));
    else return await this.post(`comments`, data);
  }
  async getConfigs(callback) {
    if (callback) callback(await this.get(`/configs`));
    else return await this.get(`/configs`);
  }
  async getConfig(id, callback) {
    if (callback) callback(await this.get(`/configs/${id}`));
    else return await this.get(`/configs/${id}`);
  }
  async updateOrCreateConfigs(data, callback) {
    if (callback) callback(await this.post(`/configs/multiple`, data));
    else return await this.post(`/configs/multiple`, data);
  }
  async updateOrCreateConfig(id, data, callback) {
    if (callback) callback(await this.post(`/configs/${id}`, data));
    else return await this.post(`/configs/${id}`, data);
  }
  async updateComment(id, data, callback) {
    if (callback) callback(await this.post(`comments/${id}`, data));
    else return await this.post(`comments/${id}`, data);
  }
  async getSettlement(data, callback) {
    if (callback) callback(await this.get(`/settlement`, data));
    else return await this.get(`/settlement`, data);
  }
  async getBoxes(data, callback) {
    if (callback) callback(await this.get(`/box`, data));
    else return await this.get(`/box`, data);
  }
  async createBox(data, callback) {
    if (callback) callback(await this.post(`/box`, data));
    else return await this.post(`/box`, data);
  }
  async getBox(id, data, callback) {
    if (callback) callback(await this.get(`/box/${id}`, data));
    else return await this.get(`/box/${id}`, data);
  }
  async updateBox(id, data, callback) {
    if (callback) callback(await this.post(`/box/${id}`, data));
    else return await this.post(`/box/${id}`, data);
  }
  async getAdjustments(data, callback) {
    if (callback) callback(await this.get(`/adjustments`, data));
    else return await this.get(`/adjustments`, data);
  }
  async createAdjustment(data, callback) {
    if (callback) callback(await this.post(`/adjustments`, data));
    else return await this.post(`/adjustments`, data);
  }
  async getAdjustment(id, data, callback) {
    if (callback) callback(await this.get(`/adjustments/${id}`, data));
    else return await this.get(`/adjustments/${id}`, data);
  }
  async updateAdjustment(id, data, callback) {
    if (callback) callback(await this.post(`/adjustments/${id}`, data));
    else return await this.post(`/adjustments/${id}`, data);
  }
  async getAdjustmentRows(data, callback) {
    if (callback) callback(await this.get(`/adjustment-rows`, data));
    else return await this.get(`/adjustment-rows`, data);
  }
  async createAuthorization(data, callback) {
    if (callback) callback(await this.post(`/authorization`, data));
    else return await this.post(`/authorization`, data);
  }
  async getAuthorizations(data, callback) {
    if (callback) callback(await this.get(`/authorization`, data));
    else return await this.get(`/authorization`, data);
  }
  async updateAuthorization(id, data, callback) {
    if (callback) callback(await this.post(`/authorization/${id}`, data));
    else return await this.post(`/authorization/${id}`, data);
  }
  async checkAuthorization(data, callback) {
    if (callback) callback(await this.get(`/authorization/check`, data));
    else return await this.get(`/authorization/check`, data);
  }
  async useAuthorization(data, callback) {
    if (callback) callback(await this.post(`/authorization/check`, data));
    else return await this.post(`/authorization/check`, data);
  }
  async postApp(data, callback) {
    if (callback) callback(await this.post(`/app`, data));
    else return await this.post(`/app`, data);
  }
  async addPoint(data, callback) {
    if (callback) callback(await this.post(`/points`, data));
    else return await this.post(`/points`, data);
  }
  async createLive(data, callback) {
    if (callback) callback(await this.post(`/lives`, data));
    else return await this.post(`/lives`, data);
  }
  async getLives(data, callback) {
    if (callback) callback(await this.get(`/lives`, data));
    else return await this.get(`/lives`, data);
  }
  async editLive(id, data, callback) {
    if (callback) callback(await this.post(`/lives/${id}`, data));
    else return await this.post(`/lives/${id}`, data);
  }
  async createBatch(data, callback) {
    if (callback) callback(await this.post(`/batch`, data));
    else return await this.post(`/batch`, data);
  }
}

export default AdminRequester;
