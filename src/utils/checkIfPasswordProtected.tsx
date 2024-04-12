import { config } from "../../config"
import axios from 'axios'

const shopName = 'gorev-8373';
const accessToken = config.shopifyAdminAccessToken;
const apiVersion = '2023-04'
const baseUrl = `https://${shopName}.myshopify.com/admin/api/${apiVersion}`;

export const checkIfPasswordProtected = async () => {
    console.log('admin api client')
    try {
        const response = await axios.get(`${baseUrl}/shop.json`, {
            headers: {
                'X-Shopify-Access-Token': accessToken,
            },
        });
        const shop = response.data.shop;
        return shop.password_enabled;
    } catch (e) {

    }
}