import { REACT_APP_SHOPIFY_URL, REACT_APP_SHOPIFY_ACCESS_TOKEN, REACT_APP_SHOPIFY_ADMIN_ACCESS_TOKEN } from '@env'

export const config = {
  primaryColor: '#884EF3',
  primaryColorDark: '#884EF3',
  logoWidth: 160,
  logoSizeRatio: 0.4, // height/width
  // shopifyUrl: 'https://rev.delivery/',
  shopifyUrl: REACT_APP_SHOPIFY_URL,
  shopifyStorefrontAccessToken: REACT_APP_SHOPIFY_ACCESS_TOKEN,
  storeName: 'REV',
  // find the shopifyAdminAccessToken
  shopifyAdminAccessToken: REACT_APP_SHOPIFY_ADMIN_ACCESS_TOKEN,
  // put in the 
  instagramUsername: 'rev.delivery',
}