import axios from "axios";

import { Cookies as ReactCookies } from "react-cookie";
import { Cookies, dataToQuery, getCookieOption } from "./utils/Utils";
const mode = process.env.REACT_APP_MODE;

const origin = mode
  ? process.env["REACT_APP_ORIGIN_" + mode.toUpperCase()] ||
    process.env.REACT_APP_ORIGIN
  : process.env.REACT_APP_ORIGIN;

class Requester {
  instance = null;
  currentToken = null; // token 상태를 저장할 변수 추가

  constructor() {
    // axios.defaults.withCredentials = true;
    this.instance = axios.create({
      baseURL: `${origin}/store`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      origin: `${origin}`,
      // withCredentials: true,
    });

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

    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (
          error.response.status === 401 &&
          error.response.data === "Unauthorized"
        ) {
          const location = window.location;
          let [, lang, ...others] = location.pathname.split("/");
          if (lang === "m") {
            lang += "/" + others[0];
          }
          if (!location.pathname.includes("/login"))
            window.location.href = `${location.origin}/${lang}/login`;
        }
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
          // instance.get(url + params)
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
    } catch (e) {
      console.log("에러 발생", e);
    }
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

  async delete(url, data) {
    let instance = this.instance;
    let result = "";
    let params = "?" + new URLSearchParams(data).toString();
    try {
      return new Promise(function (resolve, reject) {
        instance
          .delete(url + params)
          // instance.get(url + params)
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
  async Login(data, callback) {
    if (callback) callback(await this.post(`auth/token`, data));
    else return await this.post(`auth/token`, data);
  }
  async Logout(callback) {
    if (callback) callback(await this.delete(`auth`));
    else return await this.delete(`auth`);
  }

  async createCustomer(data, callback) {
    if (callback) callback(await this.post(`/customers`, data));
    else return await this.post(`/customers`, data);
  }
  async deleteCustomer(data, callback) {
    if (callback) callback(await this.delete(`/customers/me`, data));
    else return await this.delete(`/customers/me`, data);
  }

  async getCurrentCustomer(data, callback) {
    if (callback) callback(await this.get(`/customers/me`, data));
    else return await this.get(`/customers/me`, data);
  }
  async updateCustomer(data, callback) {
    if (callback) callback(await this.post(`/customers/me`, data));
    else return await this.post(`/customers/me`, data);
  }
  async getProducts(data, callback) {
    if (callback) callback(await this.get(`/products`, data));
    else return await this.get(`/products`, data);
  }
  async getProduct(id, data, callback) {
    if (callback) callback(await this.get(`/products/${id}`, data));
    else return await this.get(`/products/${id}`, data);
  }
  async getVariants(data, callback) {
    if (callback) callback(await this.get(`/variants`, data));
    else return await this.get(`/variants`, data);
  }

  async getCustomerOrders(data, callback) {
    if (callback) callback(await this.get(`/customers/me/orders`, data));
    else return await this.get(`/customers/me/orders`, data);
  }

  async getOrder(id, data, callback) {
    if (callback) callback(await this.get(`/orders/${id}`, data));
    else return await this.get(`/orders/${id}`, data);
  }

  async getCustomerOrderCancel(id, data, callback) {
    if (callback)
      callback(await this.post(`/customers/me/orders/${id}/cancel`, data));
    else return await this.post(`/customers/me/orders/${id}/cancel`, data);
  }
  async getCustomerOrderRefund(id, data, callback) {
    if (callback)
      callback(await this.post(`/customers/me/orders/${id}/refund`, data));
    else return await this.post(`/customers/me/orders/${id}/refund`, data);
  }

  async getCustomerOrderExchange(id, data, callback) {
    if (callback)
      callback(await this.post(`/customers/me/orders/${id}/exchange`, data));
    else return await this.post(`/customers/me/orders/${id}/exchange`, data);
  }
  async getCustomerAddresses(data, callback) {
    if (callback) callback(await this.get(`/customers/me/addresses`, data));
    else return await this.get(`/customers/me/addresses`, data);
  }

  async getCart(id, data) {
    return await this.get(`/carts/${id}`, data);
  }

  async getCustomerCart(data) {
    return await this.get(`/customers/me/carts`, data);
  }

  async getCategory(data, callback) {
    if (callback) callback(await this.get(`/product-categories`, data));
    else return await this.get(`/product-categories`, data);
  }

  async updateItem(cartId, itemId, data, callback) {
    if (callback)
      callback(await this.post(`carts/${cartId}/line-items/${itemId}`, data));
    else return await this.post(`carts/${cartId}/line-items/${itemId}`, data);
  }
  async removeItem(cartId, itemId, callback) {
    if (callback)
      callback(await this.delete(`carts/${cartId}/line-items/${itemId}`));
    else return await this.delete(`carts/${cartId}/line-items/${itemId}`);
  }

  async addItem(cartId, data, callback) {
    if (callback) callback(await this.post(`carts/${cartId}/line-items`, data));
    else return await this.post(`carts/${cartId}/line-items`, data);
  }

  async createCart(data) {
    return await this.post(`/carts`, data);
  }

  async updateCart(cartId, data, callback) {
    if (callback) callback(await this.post(`/carts/${cartId}`), data);
    else return await this.post(`/carts/${cartId}`, data);
  }

  async createPaymentSession(cartId, callback) {
    if (callback) callback(await this.post(`carts/${cartId}/payment-sessions`));
    else return await this.post(`carts/${cartId}/payment-sessions`);
  }

  async placeOrder(cartId, callback) {
    if (callback) callback(await this.post(`carts/${cartId}/complete`));
    else return await this.post(`carts/${cartId}/complete`);
  }

  async updateOrder(orderId, data, callback) {
    if (callback) callback(await this.post(`orders/${orderId}`, data));
    else return await this.post(`orders/${orderId}`, data);
  }

  async getInterests(data, callback) {
    if (callback) callback(await this.get("/customers/me/interests", data));
    else return await this.get("/customers/me/interests", data);
  }

  async addInterest(data, callback) {
    // const data = { product_id: productId };
    if (callback) callback(await this.post("/customers/me/interests", data));
    else return await this.post("/customers/me/interests", data);
  }

  async removeInterest(interestId, callback) {
    if (callback)
      callback(await this.delete(`/customers/me/interests/${interestId}`));
    else return await this.delete(`/customers/me/interests/${interestId}`);
  }
  async addShippingAddress(data, callback) {
    if (callback) callback(await this.post(`/customers/me/addresses`, data));
    else return await this.post(`/customers/me/addresses`, data);
  }
  async updateShippingAddress(address_id, data, callback) {
    if (callback)
      callback(await this.post(`/customers/me/addresses/${address_id}`, data));
    else return await this.post(`/customers/me/addresses/${address_id}`, data);
  }
  async deleteShippingAddress(address_id, callback) {
    if (callback)
      callback(await this.delete(`/customers/me/addresses/${address_id}`));
    else return await this.delete(`/customers/me/addresses/${address_id}`);
  }

  async getShippingOptions(data, callback) {
    if (callback) callback(await this.get(`/shipping-options`, data));
    else return await this.get(`/shipping-options`, data);
  }

  async getStores(data, callback) {
    if (callback) callback(await this.get(`/stores`, data));
    else return await this.get(`/stores`, data);
  }

  async getStoresStatus(data, callback) {
    if (callback) callback(await this.get(`/stores/status`, data));
    else return await this.get(`/stores/status`, data);
  }
  async getStoreStatus(id, data, callback) {
    if (callback) callback(await this.get(`/stores/${id}/status`, data));
    else return await this.get(`/stores/${id}/status`, data);
  }

  async getFeeds(data, callback) {
    if (callback) callback(await this.get(`/feeds/status`, data));
    else return await this.get(`/feeds/status`, data);
  }
  async getFeed(id, data, callback) {
    if (callback) callback(await this.get(`/feeds/${id}`, data));
    else return await this.get(`/feeds/${id}`, data);
  }

  async addShippingMethod(cartId, data, callback) {
    if (callback)
      callback(await this.post(`carts/${cartId}/shipping-methods`, data));
    else return await this.post(`carts/${cartId}/shipping-methods`, data);
  }

  async getArticles(data, callback) {
    if (callback) callback(await this.get(`/articles`, data));
    else return await this.get(`/articles`, data);
  } // 이 2개 이름 나중에 헷갈릴수 있어서 이름 바꿔놔야됨 위 아래래
  async getArticleContent(id, data, callback) {
    if (callback) callback(await this.get(`articles/${id}`, data));
    else return await this.get(`articles/${id}`, data);
  }
  async getCustomerArticle(id, data, callback) {
    if (callback)
      callback(await this.get(`customers/me/articles/${id}}`, data));
    else return await this.get(`customers/me/articles/${id}`, data);
  }
  async getCustomerArticles(data, callback) {
    if (callback) callback(await this.get(`customers/me/articles`, data));
    else return await this.get(`customers/me/articles`, data);
  }
  async getFollow(data, callback) {
    if (callback) callback(await this.get(`/follow`, data));
    else return await this.get(`/follow`, data);
  }
  async addFollow(data, callback) {
    if (callback) callback(await this.post(`/follow`, data));
    else return await this.post(`/follow`, data);
  }
  async deleteFollow(data, callback) {
    if (callback) callback(await this.delete(`/follow`, data));
    else return await this.delete(`/follow`, data);
  }

  async addReview(data, callback) {
    if (callback) callback(await this.post(`/reviews`, data));
    else return await this.post(`/reviews`, data);
  }
  async getReview(data, callback) {
    if (callback) callback(await this.get(`/reviews`, data));
    else return await this.get(`/reviews`, data);
  }
  async reportReview(data, callback) {
    if (callback) callback(await this.post(`customers/me/articles`, data));
    else return await this.post(`customers/me/articles`, data);
  }

  async getChat(id, data, callback) {
    if (callback) callback(await this.get(`chatroom/${id}/chat`, data));
    else return await this.get(`chatroom/${id}/chat`, data);
  }
  async getChatroom(callback) {
    if (callback) callback(await this.get(`customers/me/chatroom`));
    else return await this.get(`customers/me/chatroom`);
  }
  async addArticle(data, callback) {
    if (callback) callback(await this.post(`customers/me/articles`, data));
    else return await this.post(`customers/me/articles`, data);
  }
  async updateArticle(id, data, callback) {
    if (callback)
      callback(await this.post(`customers/me/articles/${id}`, data));
    else return await this.post(`customers/me/articles/${id}`, data);
  }
  async deleteArticle(id, data, callback) {
    if (callback)
      callback(await this.delete(`customers/me/articles/${id}`, data));
    else return await this.delete(`customers/me/articles/${id}`, data);
  }
  async getInquire(data, callback) {
    if (callback) callback(await this.get(`customers/me/articles/`, data));
    else return await this.get(`customers/me/articles/`, data);
  }
  async addComment(data, callback) {
    if (callback) callback(await this.post(`customers/me/comments`, data));
    else return await this.post(`customers/me/comments`, data);
  }
  async updateComment(id, data, callback) {
    if (callback) callback(await this.post(`customers/me/comments/${id}`, data));
    else return await this.post(`customers/me/comments/${id}`, data);
  }
  async deleteComment(id, data, callback) {
    if (callback) callback(await this.delete(`customers/me/comments/${id}`, data));
    else return await this.delete(`customers/me/comments/${id}`, data);
  }
  async getComments(data, callback) {
    if (callback) callback(await this.get(`comments`, data));
    else return await this.get(`comments`, data);
  }
  async getComment(id, data, callback) {
    if (callback) callback(await this.get(`comments/${id}`, data));
    else return await this.get(`comments/${id}`, data);
  }
  async getBoards(data, callback) {
    if (callback) callback(await this.get(`/boards`, data));
    else return await this.get(`/boards`, data);
  }

  async getRegions(callback) {
    if (callback) callback(await this.get(`/regions`));
    else return await this.get(`/regions`);
  }
  async getLogs(data, callback) {
    if (callback) callback(await this.get(`customers/me/logs/`, data));
    else return await this.get(`customers/me/logs/`, data);
  }
  async getLogLink(data, callback) {
    if (callback) callback(await this.get(`customers/me/logs/link`, data));
    else return await this.get(`customers/me/logs/link`, data);
  }

  async getRecents(data, callback) {
    if (callback) callback(await this.get(`customers/me/recents`, data));
    else return await this.get(`customers/me/recents`, data);
  }
  async getCurrentCustomerRecents(data, callback) {
    if (callback) callback(await this.get(`customers/me/recents`, data));
    else return await this.get(`customers/me/recents`, data);
  }
  async addRecent(data, callback) {
    if (callback) callback(await this.post(`customers/me/recents`, data));
    else return await this.post(`customers/me/recents`, data);
  }
  async getExchangeRate(data, callback) {
    if (callback) callback(await this.get(`/exchange-rate`, data));
    else return await this.get(`/exchange-rate`, data);
  }
  async getConfigs(data, callback) {
    if (callback) callback(await this.get(`/configs`, data));
    else return await this.get(`/configs`, data);
  }
  async getConfig(id, callback) {
    if (callback) callback(await this.get(`/configs/${id}`));
    else return await this.get(`/configs/${id}`);
  }
  async isExistUserEmail(email, callback) {
    if (callback) callback(await this.get(`/auth/user/${email}`));
    else return await this.get(`/auth/user/${email}`);
  }
  async getEmailExists(email, callback) {
    if (callback) callback(await this.get(`/auth/email/${email}`));
    else return await this.get(`/auth/email/${email}`);
  }
  async getPhoneExists(phone, callback) {
    if (callback) callback(await this.get(`/auth/phone/${phone}`));
    else return await this.get(`/auth/phone/${phone}`);
  }
  async findEmail(data, callback) {
    if (callback) callback(await this.post(`/auth/email-question`, data));
    else return await this.post(`/auth/email-question`, data);
  }
  async findPassword(data, callback) {
    if (callback) callback(await this.post(`/auth/password-question`, data));
    else return await this.post(`/auth/password-question`, data);
  }
  async changePassword(data, callback) {
    if (callback) callback(await this.post(`/auth/change-password`, data));
    else return await this.post(`/auth/change-password`, data);
  }
  async createCertification(data, callback) {
    if (callback) callback(await this.post(`/certification`, data));
    else return await this.post(`/certification`, data);
  }
  async getContents(data, callback) {
    if (callback) callback(await this.get(`/contents`, data));
    else return await this.get(`/contents`, data);
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
  async getApp(data, callback) {
    if (callback) callback(await this.get(`/app/code`, data));
    else return await this.get(`/app/code`, data);
  }
  async getPoints(data, callback) {
    if (callback) callback(await this.get(`/customers/me/points`, data));
    else return await this.get(`/customers/me/points`, data);
  }
  async getPoint(data, callback) {
    if (callback) callback(await this.get(`/customers/me/points/sum`, data));
    else return await this.get(`/customers/me/points/sum`, data);
  }
}

export default Requester;
