const https = require('https')
const axios = require('axios')
const { md5, nonce, xml2json, json2xml } = require('./helper')

class WeixinPayment {
    constructor(opts = {}) {
        this.$opts = opts
        this.$req = axios.create({
            baseURL: 'https://api.mch.weixin.qq.com',
            timeout: 1000 * 5,
            httpsAgent: new https.Agent({
                pfx: opts.pfx
            })
        })
    }

    sign(params, key) {
        const qs = Object.keys(params)
            .filter(key => key && params[key] && !['sign'].includes(key))
            .sort()
            .map(key => `${key}=${params[key]}`).join('&')
        const text = qs + "&key=" + key;
        return md5(text).toUpperCase()
    }

    req(url, params) {
        const { appid, mch_id } = this.$opts
        Object.assign(params, {
            appid,
            mch_id,
            nonce_str: nonce()
        })
        params.sign = this.sign(params, this.$opts.partner_key)
        const body = json2xml(params, { header: false })
        return this.$req
            .post(url, body)
            .then(ret => xml2json(ret.data))
    }
    
    xml2Json(xml) {
        return xml2json(xml);
    }

    json2Xml(json) {
        return json2xml(json);
    }

    createOrder(params = {}) {
        return this.req('/pay/unifiedorder', params)
    }

    queryOrder(params = {}) {
        return this.req('/pay/orderquery', params)
    }

    closeOrder(params = {}) {
        return this.req('/pay/closeorder', params)
    }

    reverseOrder(params = {}) {
        return this.req('/secapi/pay/reverse', params)
    }

    refund(params = {}) {
        return this.req('/secapi/pay/refund', params)
    }

    queryRefund(params = {}) {
        return this.req('/pay/refundquery', params)
    }

    transfers(params = {}) {
        return this.req('/mmpaymkttransfers/promotion/transfers', params)
    }

}

module.exports = WeixinPayment
