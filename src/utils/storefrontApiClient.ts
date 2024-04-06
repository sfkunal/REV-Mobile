import { config } from "../../config"

export const storefrontApiClient = async (query: string, variables: any | null = null) => {
  const URL = `${config.shopifyUrl}/api/2023-01/graphql.json`
  const options = {
    endpoint: URL,
    method: "POST",
    headers: {
      "X-Shopify-Storefront-Access-Token": config.shopifyStorefrontAccessToken,
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables })
  }

  var p = new Promise(async (resolve, reject) => {

    try {
      const data = await fetch(URL, options).then(response => {
        return response.json()
      })

      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
  return p
}


// this is an attempt to fetch the status of the store

// export const fetchStoreStatus = async () => {
//   fetch(`https://${config.shopifyUrl}.myshopify.com/admin/api/2021-07/shop.json`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-Shopify-Access-Token': config.shopifyStorefrontAccessToken,
//     },
//   })
//     .then(response => response.json())
//     .then(data => {
//       const storeStatus = data.shop.shop_status;
//       const isClosed = storeStatus === 'pause';
//       console.log(`Store is ${isClosed ? 'closed' : 'open'}`);
//       console.log(data)
//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });
// }
