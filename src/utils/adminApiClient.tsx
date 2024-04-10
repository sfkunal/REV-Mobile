import { config } from "../../config"

export const adminApiClient = async (query: string) => {
    // console.log('inside api client')
    const URL = `https://${config.storeName}.myshopify.com/admin/api/2024-04/graphql.json`
    const options = {
        endpoint: URL,
        method: "POST",
        headers: {
            "X-Shopify-Storefront-Access-Token": config.shopifyAdminAccessToken,
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query })
    }

    var p = new Promise(async (resolve, reject) => {
        try {

            const data = await fetch(URL, options).then(response => {
                return response.json()
            })
            // console.log('admin data', data)
            resolve(data)
        } catch (error) {
            reject(error)
        }
    })
    // console.log('admin P', p)
    return p
}